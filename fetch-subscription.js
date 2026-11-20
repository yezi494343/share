import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function fetchSubscriptionLink() {
  console.log('🚀 开始获取订阅链接...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // 设置超时时间
    page.setDefaultTimeout(30000);

    console.log('📱 访问登录页面...');
  await page.goto('https://gw-2.smjc2.com/#/login', {
    waitUntil: 'networkidle2'
  });

  console.log('⏳ 等待页面加载完成...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // 点击入口按钮
  console.log('🔘 查找并点击入口按钮...');
  try {
    // 尝试查找并点击蓝色按钮
    const button = await page.$('button, a.btn, .btn-primary, a[href*="gw-2.smjc2.com"]');
    if (button) {
      console.log('✅ 找到按钮，点击进入...');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => console.log('导航完成')),
        button.click()
      ]);
    } else {
      console.log('ℹ️ 未找到入口按钮，可能已经在正确页面');
    }
  } catch (error) {
    console.log('⚠️ 点击按钮时出错，继续执行:', error.message);
  }

  console.log('⏳ 再等待页面加载...');
  await new Promise(resolve => setTimeout(resolve, 3000));
    // 保存调试截图和HTML
    console.log('📸 保存登录页面截图...');
    await page.screenshot({ path: 'login-page.png', fullPage: true });

    const html = await page.content();
    fs.writeFileSync('login-page.html', html);
    console.log('💾 已保存登录页面截图和HTML到 login-page.png 和 login-page.html');

    console.log('🔍 查找登录输入框...');
    // 尝试查找所有可能的输入框
    const inputs = await page.evaluate(() => {
      const allInputs = Array.from(document.querySelectorAll('input'));
      return allInputs.map(input => ({
        type: input.type,
        name: input.name,
        id: input.id,
        className: input.className,
        placeholder: input.placeholder
      }));
    });
    console.log('📋 页面上的所有输入框:', JSON.stringify(inputs, null, 2));

    // 等待登录表单加载（增加超时时间）
    await page.waitForSelector('input', { timeout: 15000 });

    console.log('✍️ 尝试填写登录信息...');

    // 查找所有输入框
    const allInputs = await page.$$('input');
    console.log(`找到 ${allInputs.length} 个输入框`);

    if (allInputs.length >= 2) {
      // 假设第一个是邮箱，第二个是密码
      console.log('填写第一个输入框（邮箱）...');
      await allInputs[0].type(process.env.VPN_EMAIL, { delay: 100 });

      console.log('填写第二个输入框（密码）...');
      await allInputs[1].type(process.env.VPN_PASSWORD, { delay: 100 });

      // 查找并点击登录按钮
      console.log('🔍 查找登录按钮...');
      const buttons = await page.evaluate(() => {
        const allButtons = Array.from(document.querySelectorAll('button, input[type="submit"], a.btn'));
        return allButtons.map(btn => ({
          text: btn.textContent || btn.value,
          type: btn.type,
          className: btn.className
        }));
      });
      console.log('📋 页面上的所有按钮:', JSON.stringify(buttons, null, 2));

      // 点击登录按钮
      console.log('🔐 登录中...');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => console.log('导航超时，继续...')),
        page.click('button').catch(() => page.keyboard.press('Enter'))
      ]);
    } else {
      throw new Error(`输入框数量不对，只找到 ${allInputs.length} 个`);
    }

    console.log('✅ 登录成功，跳转到个人中心...');
    // 跳转到 profile 页面
    await page.goto('https://gw-2.smjc2.com/#/profile', {
      waitUntil: 'networkidle2'
    });

    // 等待页面加载
  await new Promise(resolve => setTimeout(resolve, 3000));

  // 向下滚动页面，让订阅链接区域加载出来
  console.log('📜 向下滚动页面...');
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 再次截图查看滚动后的页面
  await page.screenshot({ path: 'profile-scrolled.png', fullPage: true });
  console.log('📸 已保存滚动后的截图');

  console.log('🔍 查找订阅链接...');

    let subscriptionLink = null;

  try {
    // 直接查找包含http链接的readonly输入框
    console.log('🔎 查找订阅链接输入框...');
    const linkElement = await page.$('input[readonly][value*="http"], input[readonly]');

    if (linkElement) {
      subscriptionLink = await page.evaluate(el => el.value, linkElement);
      console.log('✅ 从输入框获取到链接');
    }

    // 如果没找到，尝试查找所有readonly输入框
    if (!subscriptionLink) {
      const allReadonlyInputs = await page.$$('input[readonly]');
      for (const input of allReadonlyInputs) {
        const value = await page.evaluate(el => el.value, input);
        if (value && value.startsWith('http')) {
          subscriptionLink = value;
          console.log('✅ 从readonly输入框找到链接');
          break;
        }
      }
    }
  } catch (error) {
    console.error('❌ 获取链接时出错:', error.message);
  }

    if (!subscriptionLink) {
      // 保存页面截图用于调试
      await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
      console.log('📸 已保存页面截图到 debug-screenshot.png，请检查页面结构');
      throw new Error('未能找到订阅链接，请检查页面结构');
    }

    console.log('✅ 成功获取订阅链接！');
    console.log('🔗 链接预览:', subscriptionLink.substring(0, 50) + '...');

    // 保存订阅链接到JSON文件
    const data = {
      link: subscriptionLink,
      updateTime: new Date().toISOString(),
      updateTimeReadable: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    };

    const docsDir = path.join(__dirname, 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(docsDir, 'subscription.json'),
      JSON.stringify(data, null, 2)
    );

    console.log('💾 已保存到 docs/subscription.json');
    console.log('🎉 完成！');

  } catch (error) {
    console.error('❌ 发生错误:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// 运行
fetchSubscriptionLink().catch(error => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});
