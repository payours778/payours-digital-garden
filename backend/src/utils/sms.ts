import Dypnsapi, {
  CheckSmsVerifyCodeRequest,
  SendSmsVerifyCodeRequest,
} from '@alicloud/dypnsapi20170525';
import { $OpenApiUtil } from '@alicloud/openapi-core';
import dotenv from 'dotenv';

dotenv.config();

const {
  ACCESS_KEY_ID,
  ACCESS_KEY_SECRET,
  SMS_SIGN_NAME,
  SMS_TEMPLATE_CODE,
  SMS_SCHEME_NAME,
} = process.env;

let client: Dypnsapi | null = null;

function getClient(): Dypnsapi | null {
  if (client) return client;
  if (!ACCESS_KEY_ID || !ACCESS_KEY_SECRET || !SMS_SIGN_NAME || !SMS_TEMPLATE_CODE) {
    console.error('[SMS] 配置缺失：需要 ACCESS_KEY_ID / ACCESS_KEY_SECRET / SMS_SIGN_NAME / SMS_TEMPLATE_CODE');
    return null;
  }
  client = new Dypnsapi(new $OpenApiUtil.Config({
    accessKeyId: ACCESS_KEY_ID,
    accessKeySecret: ACCESS_KEY_SECRET,
    endpoint: 'dypnsapi.aliyuncs.com',
  }));
  return client;
}

export interface SmsOperationResult {
  success: boolean;
  code: string;
  message: string;
}

// 号码认证服务负责生成、发送和保存验证码。
export async function sendSmsCode(phone: string): Promise<SmsOperationResult> {
  const c = getClient();
  if (!c) return { success: false, code: 'CONFIG_MISSING', message: '短信服务未配置' };

  try {
    const response = await c.sendSmsVerifyCode(new SendSmsVerifyCodeRequest({
      phoneNumber: phone,
      countryCode: '86',
      signName: SMS_SIGN_NAME!,
      templateCode: SMS_TEMPLATE_CODE!,
      templateParam: JSON.stringify({ code: '##code##', min: '5' }),
      schemeName: SMS_SCHEME_NAME || undefined,
      codeLength: 6,
      codeType: 1,
      validTime: 5 * 60,
      interval: 60,
      duplicatePolicy: 1,
      returnVerifyCode: false,
    }));
    const body = response.body;
    return {
      success: body?.success === true && body?.code === 'OK',
      code: body?.code || '',
      message: body?.message || '',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '发送异常';
    console.error('[SMS/DYPNS] 发送失败:', message);
    return { success: false, code: 'EXCEPTION', message };
  }
}

// 验证码由号码认证服务校验，PASS 才表示验证成功。
export async function verifySmsCode(phone: string, code: string): Promise<SmsOperationResult> {
  const c = getClient();
  if (!c) return { success: false, code: 'CONFIG_MISSING', message: '短信服务未配置' };

  try {
    const response = await c.checkSmsVerifyCode(new CheckSmsVerifyCodeRequest({
      phoneNumber: phone,
      countryCode: '86',
      verifyCode: code,
      schemeName: SMS_SCHEME_NAME || undefined,
      caseAuthPolicy: 1,
    }));
    const body = response.body;
    const passed = body?.success === true && body?.code === 'OK' && body?.model?.verifyResult === 'PASS';
    return {
      success: passed,
      code: body?.code || '',
      message: passed ? '验证通过' : (body?.message || '验证码错误或已过期'),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '校验异常';
    console.error('[SMS/DYPNS] 校验失败:', message);
    return { success: false, code: 'EXCEPTION', message };
  }
}
