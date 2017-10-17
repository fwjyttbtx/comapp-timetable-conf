<template>
  <div>
    <el-button class="mv-24 mh-8" @click="addNewDialog">新建学期</el-button>
    <div class="mh-8">
      <el-table
          :data="tableData"
          border
          ref="calendarTable"
          v-loading="loading"
          element-loading-text="拼命加载中"
      >
        <el-table-column prop="yearTerm" label="学期代码" width="130" align="center"></el-table-column>
        <el-table-column prop="termBegin" label="学期开始日期" width="120" align="center"></el-table-column>
        <el-table-column prop="termEnd" label="学期结束日期" width="120" align="center"></el-table-column>
        <el-table-column prop="classStart" label="上课开始日期" width="120" align="center"></el-table-column>
        <el-table-column prop="teachWeeks" label="教学周次" align="center"></el-table-column>
        <el-table-column prop="allWeeks" label="学期总周次" width="110" align="center"></el-table-column>
        <el-table-column prop="amClasses" label="上午节次" align="center"></el-table-column>
        <el-table-column prop="pmClasses" label="下午节次" align="center"></el-table-column>
        <el-table-column prop="eveClasses" label="晚上节次" align="center"></el-table-column>
        <el-table-column label="操作" align="center" width="110">
          <template scope="scope">
            <el-button @click="handleClick(scope.row)" type="text" size="small">编辑</el-button>
            <el-button type="text" size="small" @click="deleteProperty(scope.row.wid)" v-if="!scope.row.editable">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          class="text-right"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="pageNumber"
          :page-sizes="[10, 50, 150]"
          :page-size.sync="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total.sync="totalSize">
      </el-pagination>
    </div>

    <el-dialog title="新建学期信息" :visible.sync="dialogFormVisible" id="calendarForm" :close-on-click-modal="false"
               top="32px">
      <el-form ref="dialogForm" :rules="rules" :model="calendar" label-width="140px">
        <el-form-item label="学期代码" prop="yearTerm">
          <!--如果查询得到值 在下拉中无法获取 则显示一个不可编辑的输入框-->
          <el-select v-model="calendar.yearTerm" placeholder="请选择" class="w80p" v-if="calendar.hasTerm">
            <el-option v-for="item in yearTerms" :value="item.value" :label="item.label"></el-option>
          </el-select>
          <el-input :disabled="true" v-if="!calendar.hasTerm" :value="calendar.yearTerm" class="w80p"></el-input>
        </el-form-item>
        <el-form-item label="开始日期" prop="termBegin" required>
          <el-date-picker v-model="calendar.termBegin" type="date" :editable="false" format="yyyy-MM-dd" placeholder="选择学期开始日期" class="w80p" @change="termDateChange()"></el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期" prop="termEnd">
          <el-date-picker v-model="calendar.termEnd" type="date" :editable="false" format="yyyy-MM-dd" placeholder="选择学期结束日期" class="w80p" @change="termDateChange()"></el-date-picker>
        </el-form-item>
        <el-form-item label="上课开始日期" prop="classStart">
          <el-date-picker v-model="calendar.classStart" type="date" :editable="false" format="yyyy-MM-dd" placeholder="选择上课开始日期" class="w80p"></el-date-picker>
        </el-form-item>
        <el-form-item label="教学周次" prop="teachWeeks">
          <el-input-number v-model="calendar.teachWeeks" :min="1" class="w80p"></el-input-number>
        </el-form-item>
        <el-form-item label="学期总周次" prop="allWeeks">
          <el-input-number v-model="calendar.allWeeks" :min="1" class="w80p"></el-input-number>
        </el-form-item>
        <el-form-item label="上午节次" prop="amClasses">
          <el-input-number v-model="calendar.amClasses" :min="1" :max="10" class="w80p"></el-input-number>
        </el-form-item>
        <el-form-item label="下午节次" prop="pmClasses">
          <el-input-number v-model="calendar.pmClasses" :min="1" :max="10" class="w80p"></el-input-number>
        </el-form-item>
        <el-form-item label="晚上节次" prop="eveClasses">
          <el-input-number v-model="calendar.eveClasses" :min="1" :max="10" class="w80p"></el-input-number>
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

  export default {
    data() {
      return {
        loading: true,
        tableData: [],
        pageNumber: 1,
        pageSize: 10,
        totalSize: 0,
        schools: [],
        yearTerms: [],
        dialogFormVisible: false,
        calendar: {
          yearTerm: "",
          termBegin: null,
          termEnd: null,
          classStart: null,
          allWeeks: null,
          teachWeeks: null,
          amClasses: 4,
          pmClasses: 4,
          eveClasses: 4
        },
        rules: {
          yearTerm: [
            {required: true, message: "学年学期选择不能为空", trigger: "change"}
          ],
          termBegin: [
            {type: 'date', validator: (rule, value, callback) => {
              if(!value) {
                callback(new Error("请选择学期开始日期"))
              } else {
                if(this.calendar.termEnd) {
                  this.$refs['dialogForm'].validateField("termEnd");
                }
                callback()
              }
            }, trigger: "change"}
          ],
          termEnd: [
            {type: 'date', required: true, message: "请选择学期结束日期", trigger: "change"},
            {validator: (rule, value, callback) => {
              if(value && value <= this.calendar.termBegin) {callback(new Error("学期结束日期应该大于学期开始日期"))}
            }, trigger: "change"}
          ],
          classStart: [
            {type: 'date', required: true, message: "请选择学期开始上课日期", trigger: "change"},
            {validator: (rule, value, callback) => {
              if(value && moment(value).day() !== 1) {callback(new Error("上课的日期应该为上课周的周一，当前日期并非周一日期。"))}
            }, trigger: "change"}
          ]
        }
      }
    },
    created() {
      let now = new Date();
      let currentYear = now.getFullYear();
      let lastYear = currentYear - 1;
      for (let i = 1; i < 5; i++) {
        this.yearTerms.push({value: `${lastYear}-${currentYear}-1`, label: `${lastYear}到${currentYear}学年第一学期`});
        this.yearTerms.push({value: `${lastYear}-${currentYear}-2`, label: `${lastYear}到${currentYear}学年第二学期`});
        this.yearTerms.push({value: `${lastYear}-${currentYear}-3`, label: `${lastYear}到${currentYear}学年第三学期`});
        this.yearTerms.push({value: `${lastYear}-${currentYear}-4`, label: `${lastYear}到${currentYear}学年第四学期`});
        lastYear++;
        currentYear++;
      }
      this.fillTableData();
    },
    methods: {
      termDateChange() {
        if(this.calendar.termBegin && this.calendar.termEnd) {
          let start = moment(this.calendar.termBegin);
          let end = moment(this.calendar.termEnd);
          this.calendar.teachWeeks = this.calendar.allWeeks = end.diff(start, 'weeks') + 1;
        }
      },
      submitForm() {
        let vm = this;
        vm.$refs['dialogForm'].validate((valid) => {
          if (valid) {
            vm.calendar.termBegin = moment(vm.calendar.termBegin).format('YYYY-MM-DD');
            vm.calendar.termEnd = moment(vm.calendar.termEnd).format('YYYY-MM-DD');
            vm.calendar.classStart= moment(vm.calendar.classStart).format('YYYY-MM-DD');
            if (vm.calendar.edit) {
              vm.$http.put(api.calendar, vm.calendar).then(resp => {
                if (resp.status === 200 && resp.data.code === '0') {
                  vm.dialogFormVisible = false;
                  vm.reloadTable();
                  this.$message.success(`更新校历信息成功。`);
                } else {
                  this.$message.error(`更新校历信息失败${resp.data.message}`);
                }
              }, fail => {
                this.$message.error(`更新校历信息失败`);
                console.error(`%c${fail}`, 'font-style: italic;')
              });
            } else {
              vm.$http.post(api.calendar, vm.calendar).then(resp => {
                if (resp.status === 200 && resp.data.code === '0') {
                  vm.dialogFormVisible = false;
                  vm.reloadTable();
                  this.$message.success(`保存校历信息成功。`);
                } else {
                  this.$message.error(`保存校历信息失败${resp.data.message}`);
                }
              }, fail => {
                this.$message.error(`保存校历信息失败`);
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
        vm.$http.get(api.calendars, {params: {pageSize: pageSize, pageNumber: pageNumber}}).then((resp) => {
          if (resp.status === 200 && resp.data.code === '0') {
            vm.tableData = resp.data.calendars;
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
        this.calendar = {
          yearTerm: "",
          hasTerm: true,
          termBegin: null,
          termEnd: null,
          classStart: null,
          teachWeeks: null,
          allWeeks: null,
          amClasses: 4,
          pmClasses: 4,
          eveClasses: 4
        };
        this.calendar.yearTerm = this.yearTerms[4].value;
        this.dialogFormVisible = true;
        if (this.$refs['dialogForm']) this.$refs['dialogForm'].resetFields();
      },
      handleClick(row) {
        // 复制一份副本 避免row内容同步做了更新
        let calendar = JSON.parse(JSON.stringify(row));
        this.yearTerms.forEach(yearTerm => {
          if(yearTerm.value === calendar.yearTerm) calendar.hasTerm = true;
        });
        calendar.edit = true;
        this.calendar = calendar;
        this.dialogFormVisible = true;
        if (this.$refs['dialogForm']) this.$refs['dialogForm'].resetFields();
      },
      deleteProperty(wid) {
        let vm = this;
        vm.$msgbox.confirm("确定删除当前校历吗？", "警告", {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          vm.$http.delete(`${api.calendar}/${wid}`).then(resp => {
            if (resp.status === 200 && resp.data.code === '0') {
              vm.$message.success(`删除校历信息成功。`);
              vm.reloadTable();
            } else {
              vm.$message.error(`删除校历信息失败${resp.data.message}`);
            }
          }, fail => console.error(`%c${fail}`, 'font-style: italic;'))
        }).catch(() => vm.$message.info(`取消删除。`));
      }
    }
  }
</script>