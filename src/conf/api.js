let addr = location.href;
let addrMatch = addr.match(/comapp-[^\/]*/);
let context = addrMatch ? addrMatch[0] : console.error("无法通过url获取到公共服务的上下文");
let basePath = (env && env.dev) ? `http://127.0.0.1:8080/${context}/sys/timetable-conf/api` : `${location.protocol}//${location.host}/${context}/sys/timetable-conf/api`;

export default {
    schools: `${basePath}/`,
    properties: `${basePath}/properties`,
    property: `${basePath}/property`,
    schoolRedisCache: `${basePath}/school-redis-cache`

}