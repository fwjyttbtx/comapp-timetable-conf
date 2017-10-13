let addr = location.href;
let addrMatch = addr.match(/comapp-[^\/]*/);
let context = addrMatch ? addrMatch[0] : console.error("无法通过url获取到公共服务的上下文");
let basePath = (env && env.dev) ? `http://172.20.6.189/${context}/sys/timetable-manage/api` : `${location.protocol}//${location.host}/${context}/sys/timetable-manage/api`;

export default {
    calendars: `${basePath}/calendars`,
    calendar: `${basePath}/calendar`,
    schedules: `${basePath}/schedules`,
    schedule: `${basePath}/schedule`,
    defaultCalendar: `${basePath}/calendar/default`

}