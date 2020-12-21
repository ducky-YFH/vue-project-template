import axios from "axios";
import { Toast } from "vant";

const LOADING = {
  start() {
    Toast.loading({
      message: "加载中...",
      forbidClick: true,
      duration: 0,
    });
  },
  end() {
    Toast.clear();
  }
}

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
  timeout: 10 * 1000,
});

service.interceptors.request.use(
  (config) => {
    // 加入后端需要的用户授权信息
    LOADING.start();
    config.headers = {
      "Content-Type": "application/json",
    };
    return config;
  },
  (error) => {
    LOADING.end();
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  (response) => {
    LOADING.end();
    return response.data;
  },
  (error) => {
    LOADING.end();
    // 请求失败
    if (error && error.response) {
      switch (error.response.status) {
        case 400:
          Toast.fail("错误请求");
          break;
        case 401:
          Toast.fail("未授权，请重新登录");
          break;
        case 403:
          Toast.fail("拒绝访问");
          break;
        case 404:
          Toast.fail("请求错误,未找到该资源");
          // 跳转到404页面
          break;
        case 405:
          Toast.fail("请求方法未允许");
          break;
        case 408:
          Toast.fail("请求超时");
          break;
        case 500:
          Toast.fail("服务器端出错");
          break;
        case 501:
          Toast.fail("网络未实现");
          break;
        case 502:
          Toast.fail("网络错误");
          break;
        case 503:
          Toast.fail("服务不可用");
          break;
        case 504:
          Toast.fail("网络超时");
          break;
        case 505:
          Toast.fail("http版本不支持该请求");
          break;
        default:
          Toast.fail(`连接错误${error.response.status}`);
      }
      return;
    }
    Toast.fail("接口错误");
  }
);

export default service;
