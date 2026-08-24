import Dysmsapi, { SendSmsRequest } from '@alicloud/dysmsapi20170525';
import { $OpenApiUtil } from '@alicloud/openapi-core';
import dotenv from 'dotenv';

dotenv.config();

const {
  ACCESS_KEY_ID,
  ACCESS_KEY_SECRET,
  SMS_SIGN_NAME,
  SMS_TEMPLATE_CODE,
  SMS_REGION,
} = process.env;

let client: Dysmsapi | null = null;

function getClient(): Dysmsapi | null {
  if (client) return client;
  if (!ACCESS_KEY_ID || !ACCESS_KEY_SECRET || !SMS_SIGN_NAME || !SMS_TEMPLATE_CODE) {
    console.error('[SMS] 配置缺失：需要 ACCESS_KEY_ID / ACCESS_KEY_SECRET / SMS_SIGN_NAME / SMS_TEMPLATE_CODE');
    return null;
  }
  client = new Dysmsapi(
    new $OpenApiUtil.Config({
      accessKeyId: ACCESS_KEY_ID,
      accessKeySecret: ACCESS_KEY_SECRET,
      endpoint: SMS_REGION === 'cn-hangzhou' ? 'dysmsapi.aliyuncs.com' : `dysmsapi.${SMS_REGION}.aliyuncs.com`,
    })
  );
  return client;
}

export interface SendSmsResult {
  success: boolean;
  code: string;   // 阿里云返回码，OK 表示成功
  message: string;
}

// 发送短信验证码
export async function sendSmsCode(phone: string, code: string): Promise<SendSmsResult> {
  const c = getClient();
  if (!c) {
    return { success: false, code: 'CONFIG_MISSING', message: '短信服务未配置' };
  }
  try {
    const response = await c.sendSms(
      new SendSmsRequest({
        phoneNumbers: phone,
        signName: SMS_SIGN_NAME!,
        templateCode: SMS_TEMPLATE_CODE!,
        templateParam: JSON.stringify({ code }),
      })
    );
    const body = response.body;
    if (!body) {
      return { success: false, code: 'NO_BODY', message: '无响应内容' };
    }
    return {
      success: body.code === 'OK',
      code: body.code || '',
      message: body.message || '',
    };
  } catch (err: any) {
    console.error('[SMS] 发送失败:', err.message || err);
    return { success: false, code: 'EXCEPTION', message: err.message || '发送异常' };
  }
}