<template>
  <div>
    <el-button class="mv-24 mh-8" @click="addNewDialog">新建学校节次时刻信息</el-button>
    <div class="mh-8">
      <el-table
          :data="tableData"
          border
          ref="scheduleTable"
          v-loading="loading"
          element-loading-text="拼命加载中"
          id="scheduleTable"
      >
        <el-table-column type="expand" class="extend-info">
          <template scope="scope">
            <el-table width="50%" :data="scope.row.sections.slice(0, Math.ceil(scope.row.sections.length / 2))" :show-header="false">
              <el-table-column prop="sectionDesc" label="节次" header-align="center"></el-table-column>
              <el-table-column prop="sectionStart" label="节次开始时间" header-align="center"></el-table-column>
              <el-table-column prop="sectionEnd" label="节次结束时间" header-align="center"></el-table-column>
            </el-table>
            <el-table :data="scope.row.sections.slice(Math.ceil(scope.row.sections.length / 2))" :show-header="false">
              <el-table-column prop="sectionDesc" label="节次" header-align="center"></el-table-column>
              <el-table-column prop="sectionStart" label="节次开始时间" header-align="center"></el-table-column>
              <el-table-column prop="sectionEnd" label="节次结束时间" header-align="center"></el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column prop="sequence" label="序号" header-align="center"></el-table-column>
        <el-table-column prop="scheduleStart" label="时刻开始日期" header-align="center"></el-table-column>
        <el-table-column prop="scheduleEnd" label="时刻结束日期" header-align="center"></el-table-column>
        <el-table-column label="操作" align="center">
          <template scope="scope">
            <el-button @click="handleClick(scope.row)" type="text" size="small">编辑</el-button>
            <el-button type="text" size="small" @click="deleteProperty(scope.row.scheduleStart, scope.row.scheduleEnd)" v-if="!scope.row.editable">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          class="text-right"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="pageNumber"
          :page-sizes="[20, 50, 150]"
          :page-size.sync="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total.sync="totalSize">
      </el-pagination>
    </div>

    <el-dialog title="新建节次时刻信息" :visible.sync="dialogFormVisible" id="scheduleForm" :close-on-click-modal="false" top="32px" size="fix-1000">
      <el-form ref="dialogForm" :rules="rules" :model="schedule" label-width="140px">
        <el-form-item label="开始日期" prop="scheduleStart">
          <el-col :span="12">
            <el-date-picker v-model="schedule.scheduleStart" type="date" placeholder="此项选择为空则认为为此时刻为全年时刻信息" class="w100p"></el-date-picker>
          </el-col>
        </el-form-item>
        <el-form-item label="结束日期" prop="scheduleEnd">
          <el-col :span="12">
            <el-date-picker v-model="schedule.scheduleEnd" type="date" placeholder="此项选择为空则认为为此时刻为全年时刻信息" class="w100p"></el-date-picker>
          </el-col>
        </el-form-item>
        <el-form-item label="课时时长（分钟）" prop="timesRange" :required="true">
          <el-col :span="12">
            <el-input-number :min="0" v-model="schedule.sectionRange" placeholder="输入一节课的课时时长，单位分钟" class="w100p"></el-input-number>
          </el-col>
          <el-col :span="12">
            <div>　　填入0可自定义课时节次时长</div>
          </el-col>
        </el-form-item>
        <el-form-item label="节次时刻" prop="times">
          <el-row v-for="(section, index) in schedule.sections" class="mb-20">
            <el-col :span="6">
              <el-form-item :prop="`sections.${index}.sectionDesc`"
                            :rules="{required: true, message: '描述信息不能为空', trigger: 'blur'}"
              >
                <el-input v-model="section.sectionDesc" type="text" style="width: 95%;"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :prop="`sections.${index}.sectionStartDate`"
                            :rules="{validator: sectionStartCheck, trigger: 'change', type: 'date'}"
              >
                <el-time-picker
                    :editable="false"
                    placeholder="起始时间"
                    v-model="section.sectionStartDate"
                    :picker-options="{format: 'HH:mm'}"
                    format="HH:mm"
                    align="center"
                    style="width: 95%;"
                    @change="startTimeSelect(section)"
                ></el-time-picker>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :prop="`sections.${index}.sectionEndDate`"
                            :rules="{validator: sectionEndCheck, trigger: 'change', type: 'date'}"
              >
                <el-time-picker
                    :editable="false"
                    placeholder="结束时间"
                    v-model="section.sectionEndDate"
                    :picker-options="{format: 'HH:mm'}"
                    format="HH:mm"
                    align="center"
                    style="width: 95%;"
                    :disabled="schedule.sectionRange > 0"
                ></el-time-picker>
              </el-form-item>
            </el-col>
            <el-button @click="deleteSectionRow(section)" type="text" size="small" v-if="index === (schedule.sections.length - 1) && schedule.sections.length > 1">删除</el-button>
            <el-button @click="addSectionRow(section)" type="text" size="small" v-if="index === (schedule.sections.length - 1)">添加</el-button>
          </el-row>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import api from '../conf/api'
  const moment = require('moment');

  const NUM_CN = [
    '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '二十一', '二十二', '二十三', '二十四', '二十五', '二十六', '二十七', '二十八', '二十九', '三十'
  ];

  export default {
    data() {
      return {
        loading: true,
        defaultSections: [],
        tableData: [],
        pageNumber: 1,
        pageSize: 20,
        totalSize: 0,
        schools: [],
        yearTerms: [],
        dialogFormVisible: false,
        schedule: {},
        rules: {
          scheduleStart: [
            {validator: (rule, value, callback) => {
              if(value && this.schedule.scheduleEnd) {
                this.$refs['dialogForm'].validateField("scheduleEnd")
              }
              callback()
            }, trigger: "change"}
          ],
          scheduleEnd: [
            {validator: (rule, value, callback) => {
              if(value && value <= this.schedule.scheduleStart) {
                callback(new Error("作息时间的结束日期应该大于作息开始的日期"))
              } else {
                callback()
              }
            }, trigger: "change"}
          ]
        }
      }
    },
    created() {
      let vm = this;
      vm.$http.get(api.defaultCalendar).then(resp => {
        if (resp.status === 200 && resp.data.code === '0') {
          let data = resp.data;
          let totalClasses = data.amClasses + data.pmClasses + data.eveClasses;
          this.buildDefaultSections(totalClasses);
        } else {
          this.buildDefaultSections(12);
        }
      }, fail => {
        this.buildDefaultSections(12);
        console.error(`%c${fail}`, 'font-style: italic;');
      });
      vm.reloadTable();
    },
    methods: {
      sectionStartCheck(rule, value, callback) {
        if(!value) {
          callback(new Error("作息开始时间不能为空。"));
        } else {
          let propsArr = rule.field.split(".");
          let endDate = this.schedule.sections[parseInt(propsArr[1])].sectionEndDate;
          if(endDate) {
            this.$refs['dialogForm'].validateField("sections." + propsArr[1] + ".sectionEndDate");
          }
          callback();
        }
      },
      sectionEndCheck(rule, value, callback) {
        if(!value) {
          callback(new Error("作息结束时间不能为空。"));
          return;
        }
        let section = this.schedule.sections[parseInt(rule.field.split(".")[1])];
        let sectionStart = section.sectionStartDate;
        if(value && sectionStart && value < sectionStart) {
          callback(new Error("作息的结束时间应该要大于开始时间"))
        } else {
          callback();
        }
      },
      startTimeSelect(section) {
        if(this.schedule.sectionRange <= 0) return;
        if(section.sectionStartDate) {
          section.sectionEndDate = moment(section.sectionStartDate).add(this.schedule.sectionRange, "minutes");
        } else {
          section.sectionEndDate = "";
        }
      },
      deleteSectionRow(section) {
        this.schedule.sections.pop()
      },
      addSectionRow() {
        this.schedule.sections.push(
          {sectionDesc: `第${NUM_CN[this.schedule.sections.length]}节课`, sectionStart: "", sectionEnd: "", sectionStartDate: "", sectionEndDate: ""}
        )
      },
      buildDefaultSections(total) {
        this.defaultSections = [];
        for(let i = 0; i < total; i++) {
          this.defaultSections.push(
            {sectionDesc: `第${NUM_CN[i]}节课`, sectionStart: "", sectionEnd: "", sectionStartDate: "", sectionEndDate: ""}
          )
        }
      },
      submitForm() {
        let vm = this;
        vm.$refs['dialogForm'].validate((valid) => {
          if (valid) {
            if(vm.schedule.scheduleStart && vm.schedule.scheduleEnd) {
              vm.schedule.scheduleStart = moment(vm.schedule.scheduleStart).format('YYYY-MM-DD');
              vm.schedule.scheduleEnd = moment(vm.schedule.scheduleEnd).format('YYYY-MM-DD');
            }
            vm.schedule.sections.forEach(section => {
              section.sectionStart = moment(section.sectionStartDate).format('HH:mm');
              section.sectionEnd = moment(section.sectionEndDate).format('HH:mm');
            });
            if (vm.schedule.edit) {
              vm.$http.put(api.schedule, vm.schedule).then(resp => {
                if (resp.status === 200 && resp.data.code === '0') {
                  vm.dialogFormVisible = false;
                  vm.reloadTable();
                  this.$message.success(`更新作息信息成功。`);
                } else {
                  this.$message.error(`更新作息信息失败${resp.data.message}`);
                }
              }, fail => {
                this.$message.error(`更新作息信息失败`);
                console.error(`%c${fail}`, 'font-style: italic;')
              });
            } else {
              vm.$http.post(api.schedule, vm.schedule).then(resp => {
                if (resp.status === 200 && resp.data.code === '0') {
                  vm.dialogFormVisible = false;
                  vm.reloadTable();
                  this.$message.success(`保存作息信息成功。`);
                } else {
                  this.$message.error(`保存作息信息失败${resp.data.message}`);
                }
              }, fail => {
                this.$message.error(`保存作息信息失败`);
                console.error(`%c${fail}`, 'font-style: italic;')
              });
            }
          } else {
            return false;
          }
        });
      },
      handleSizeChange(val) {
        this.pageSize = val;
        this.fillTableData(val, this.pageNumber);
      },
      handleCurrentChange(val) {
        this.pageNumber = val;
        this.fillTableData(this.pageSize, val);
      },
      fillTableData(pageSize, pageNumber) {
        let vm = this;
        vm.$http.get(api.schedules, {params: {pageSize: pageSize, pageNumber: pageNumber}}).then((resp) => {
          if (resp.status === 200 && resp.data.code === '0') {
            vm.tableData = resp.data.schedules;
            vm.tableData.forEach(schedule => {
              schedule.scheduleStart = schedule.scheduleStart || "全年";
              schedule.scheduleEnd = schedule.scheduleEnd || "全年";
            });
            vm.pageNumber = resp.data.pageNumber || 1;
            vm.totalSize = resp.data.total || 0;
            vm.pageSize = resp.data.pageSize || 10;
          }
          vm.loading = false;
        }, fail => {
          console && console.error(`%c${fail}`, 'font-style: italic;');
          vm.loading = false;
        });
      },
      reloadTable() {
        this.pageNumber = 1;
        this.fillTableData(this.pageSize, this.pageNumber);
      },
      addNewDialog() {
        this.schedule = {
          scheduleStart: "",
          scheduleEnd: "",
          sectionRange: "50",
          sections: JSON.parse(JSON.stringify(this.defaultSections))
        };
        this.dialogFormVisible = true;
        if (this.$refs['dialogForm']) this.$refs['dialogForm'].resetFields();
      },
      handleClick(row) {
        // 复制一份副本 避免row内容同步做了更新
        let schedule = JSON.parse(JSON.stringify(row));
        schedule.scheduleStart = schedule.scheduleStart === '全年' ? '' : schedule.scheduleStart;
        schedule.scheduleEnd = schedule.scheduleEnd === '全年' ? '' : schedule.scheduleEnd;
        // 检查是否每个课节次的间隔时间都是一样的如果一样填入sectionRange 如果不一致 填入0
        let range;
        schedule.sections.forEach((section, idx) => {
          let startArr = section.sectionStart.split(':');
          let endArr = section.sectionEnd.split(':');
          section.sectionStartDate = new Date(1900, 1, 1, parseInt(startArr[0]), parseInt(startArr[1]), 0);
          section.sectionEndDate = new Date(1900, 1, 1, parseInt(endArr[0]), parseInt(endArr[1]), 0);
          if(range === 0) return true;
          let startMoment = moment(section.sectionStartDate);
          let endMoment = moment(section.sectionEndDate);
          let sectionRange = endMoment.diff(startMoment, 'minutes');
          if(!range) {
            range = sectionRange
          } else if(range !== sectionRange) {
            range = 0
          }
        });
        schedule.sectionRange = range;
        this.schedule = schedule;
        this.schedule.edit = true;
        this.dialogFormVisible = true;
        if (this.$refs['dialogForm']) this.$refs['dialogForm'].resetFields();
      },
      deleteProperty(scheduleStart, scheduleEnd) {
        let vm = this;
        vm.$msgbox.confirm("确定删除当前作息吗？", "警告", {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let realStart = (!scheduleStart || scheduleStart === '全年') ? 'all' : scheduleStart;
          let realEnd = (!scheduleEnd || scheduleEnd === '全年') ? 'all' : scheduleEnd;
          vm.$http.delete(`${api.schedule}/${realStart}/${realEnd}`).then(resp => {
            if (resp.status === 200 && resp.data.code === '0') {
              vm.$message.success(`删除作息信息成功。`);
              vm.reloadTable();
            } else {
              vm.$message.error(`删除作息信息失败${resp.data.message}`);
            }
          }, fail => console.error(`%c${fail}`, 'font-style: italic;'))
        }).catch(() => vm.$message.info(`取消删除。`));
      }
    }
  }
</script>
<style lang="scss">
  #scheduleTable .el-table__expanded-cell {
    padding: 0 !important;
  }
  #scheduleTable .el-table__expanded-cell>div.el-table {
    width: 50%;
    display: inline-block;
    float: left;
  }
</style>