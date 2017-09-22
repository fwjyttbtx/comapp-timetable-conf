<template>
    <el-row class="tools-menu-page">
      <el-col :span="4" class="tools-menu-col">
        <el-menu default-active="calendar" class="tools-menu" theme="light" :router="true">
          <el-menu-item index="calendar">校历信息</el-menu-item>
          <el-menu-item index="schedule">节次时刻表</el-menu-item>
        </el-menu>
      </el-col>
      <el-col class="el" :span="20">
        <router-view></router-view>
      </el-col>
    </el-row>
</template>

<script>
  import "./assets/base.css"


  export default {
      methods: {
      },
      created() {
          this.$router.replace("/calendar");
      }
  }

</script>
<style>
  * {
    font-family: "Microsoft YaHei", "微软雅黑", Arial, sans-serif;;
  }
  body {
    margin: 0;
    padding: 0;
  }
  html,
  body,
  .tools-menu-page,
  .tools-menu-col,
  .tools-menu {
    height: 100%;
  }
</style>