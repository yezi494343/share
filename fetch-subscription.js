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
    page.setDefaultTimeout(30000);

    // 访问登录页面
    console.log('📱 访问登录页面...');
    await page.goto('https://gw-2.smjc2.com/#/login', {
      waitUntil: 'networkidle2'
    });
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 点击入口按钮
    console.log('🔘 点击入口按钮...');
    const button = await page.$('button, a.btn, .btn-primary, a[href*="gw-2.smjc2.com"]');
    if (button) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {}),
        button.click()
      ]);
    }
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 等待并填写登录表单
    await page.waitForSelector('input', { timeout: 15000 });
    const allInputs = await page.$$('input');

    if (allInputs.length < 2) {
      throw new Error(`输入框数量不对，只找到 ${allInputs.length} 个`);
    }

    console.log('✍️ 填写登录信息...');
    await allInputs[0].type(process.env.VPN_EMAIL, { delay: 100 });
    await allInputs[1].type(process.env.VPN_PASSWORD, { delay: 100 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 点击登录按钮
    console.log('🔐 登录中...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const loginBtn = buttons.find(btn => {
        const text = (btn.textContent || '').trim().toLowerCase();
        return text === '登录' || text === 'sign in' || text.includes('sign');
      });
      if (loginBtn) loginBtn.click();
    });

    // 等待登录完成
    console.log('⏳ 等待登录完成...');
    try {
      await page.waitForFunction(
        () => !window.location.href.includes('/login'),
        { timeout: 15000 }
      );
    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      throw new Error('登录失败，URL未离开登录页');
    }

    // 跳转到个人中心
    console.log('✅ 登录成功，进入用户中心...');
    await page.goto('https://gw-2.smjc2.com/#/profile', {
      waitUntil: 'networkidle2'
    });
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 滚动页面
    console.log('📜 滚动到订阅区域...');
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 500));
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 点击复制按钮并获取链接
    console.log('📋 获取订阅链接...');
    const context = browser.defaultBrowserContext();
    await context.overridePermissions('https://gw-2.smjc2.com', ['clipboard-read', 'clipboard-write']);

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
      const btn = buttons.find(el => {
        const text = (el.textContent || el.innerText || '').trim();
        return text === 'Copy Subscription Link';
      });
      if (btn) btn.click();
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    const subscriptionLink = await page.evaluate(() => navigator.clipboard.readText());

    if (!subscriptionLink || !subscriptionLink.startsWith('http')) {
      throw new Error('未能获取到有效的订阅链接');
    }

    console.log('✅ 成功获取订阅链接！');
    console.log('🔗 链接预览:', subscriptionLink.substring(0, 50) + '...');

    // 保存到JSON文件
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

fetchSubscriptionLink().catch(error => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});
