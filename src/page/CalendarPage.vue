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
                <el-table-column prop="yearTerm" label="学期代码" width="100" header-align="center"></el-table-column>
                <el-table-column prop="termStart" label="学期开始日期" header-align="center"></el-table-column>
                <el-table-column prop="termEnd" label="学期结束日期" header-align="center"></el-table-column>
                <el-table-column prop="classStart" label="上课开始日期" header-align="center"></el-table-column>
                <el-table-column prop="teachWeeks" label="教学周次" header-align="center"></el-table-column>
                <el-table-column prop="allWeeks" label="学期总周次" header-align="center"></el-table-column>
                <el-table-column prop="amClasses" label="上午节次" header-align="center"></el-table-column>
                <el-table-column prop="pmClasses" label="下午节次" header-align="center"></el-table-column>
                <el-table-column prop="eveClasses" label="晚上节次" header-align="center"></el-table-column>
                <el-table-column label="操作" align="center">
                    <template scope="scope">
                        <el-button @click="handleClick(scope.row)" type="text" size="small">编辑</el-button>
                        <el-button type="text" size="small" @click="deleteProperty(scope.row.wid)" v-if="!scope.row.editable">删除</el-button>
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

        <el-dialog title="新建学期信息" :visible.sync="dialogFormVisible" id="calendarForm" :close-on-click-modal="false" top="32px">
            <el-form ref="dialogForm" :rules="rules" :model="calendar" label-width="120px">
                <el-form-item label="学期代码" prop="yearTerm">
                    <el-select v-model="calendar.yearTerm" placeholder="请选择" class="w80p">
                        <el-option v-for="item in yearTerms" :value="item.value" :label="item.label"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="开始日期" prop="termStart">
                    <el-date-picker v-model="calendar.termStart" type="date" placeholder="选择学期开始日期" class="w80p"></el-date-picker>
                </el-form-item>
                <el-form-item label="结束日期" prop="termEnd">
                    <el-date-picker v-model="calendar.termEnd" type="date" placeholder="选择学期结束日期" class="w80p"></el-date-picker>
                </el-form-item>
                <el-form-item label="上课开始日期" prop="classStart">
                    <el-date-picker v-model="calendar.classStart" type="date" placeholder="选择上课开始日期" class="w80p"></el-date-picker>
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
                calendar: {yearTerm: "", termStart: null, termEnd: null, classStart: null, amClasses: 1, pmClasses: 1, eveClasses: 1},
                rules: {
                    key: [{required: true, message: "配置键不能为空", trigger: "blur"}],
                    value: [{required: true, message: "配置值不能为空", trigger: "blur"}]
                }
            }
        },
        created() {
            let now = new Date();
            let currentYear = now.getFullYear();
            let lastYear = currentYear - 1;
            for(let i = 1; i < 5; i++) {
                this.yearTerms.push({value: `${lastYear}-${currentYear}-1`, label: `${lastYear}到${currentYear}学年第一学期`});
                this.yearTerms.push({value: `${lastYear}-${currentYear}-2`, label: `${lastYear}到${currentYear}学年第二学期`});
                this.yearTerms.push({value: `${lastYear}-${currentYear}-3`, label: `${lastYear}到${currentYear}学年第三学期`});
                this.yearTerms.push({value: `${lastYear}-${currentYear}-4`, label: `${lastYear}到${currentYear}学年第四学期`});
                lastYear++;
                currentYear++;
            }
            this.calendar.yearTerm = this.yearTerms[4].value;
            this.fillTableData();
            this.$http.get(api.schools).then(resp => {
                if(resp.status === 200 && resp.data.code === '0') {
                    let schools = resp.data.schools;
                    schools.forEach((val, idx) => {
                        val.editable = false;
                    });
                    this.schools = schools;
                }
            }, fail => console && console.error(`%c${fail}`, 'font-style: italic;'))
        },
        methods: {
            submitForm() {
                let vm = this;
                vm.$refs['dialogForm'].validate((valid) => {
                    if (valid) {
                        if(vm.property.edit) {
                            vm.$http.post(api.property, vm.property).then(resp => {
                                if(resp.status === 200 && resp.data.code === '0') {
                                    vm.dialogFormVisible = false;
                                    vm.reloadTable();
                                    this.$message.success(`更新配置信息成功。`);
                                } else {
                                    this.$message.error(`更新配置信息失败${resp.data.message}`);
                                }
                            }, fail => {
                                this.$message.error(`更新配置信息失败`);
                                console.error(`%c${fail}`, 'font-style: italic;')
                            });
                        } else {
                            vm.$http.put(api.property, vm.property).then(resp => {
                                if(resp.status === 200 && resp.data.code === '0') {
                                    vm.dialogFormVisible = false;
                                    vm.reloadTable();
                                    this.$message.success(`保存配置信息成功。`);
                                } else {
                                    this.$message.error(`保存配置信息失败${resp.data.message}`);
                                }
                            }, fail => {
                                this.$message.error(`保存配置信息失败`);
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
                vm.$http.get(api.properties, {params: {pageSize: pageSize, pageNumber: pageNumber}}).then((resp) => {
                    if(resp.status === 200 && resp.data.code === '0') {
                        vm.tableData = resp.data.properties;
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
                this.property = {key: "", value: "", schoolId: ""};
                this.dialogFormVisible = true;
                if(this.$refs['dialogForm']) this.$refs['dialogForm'].resetFields();
            },
            handleClick(row) {
                // 复制一份副本 避免row内容同步做了更新
                this.property = JSON.parse(JSON.stringify(row));
                this.property.edit = true;
                this.dialogFormVisible = true;
                if(this.$refs['dialogForm']) this.$refs['dialogForm'].resetFields();
            },
            deleteProperty(wid) {
                let vm = this;
                vm.$msgbox.confirm("确定删除当前配置吗？", "警告", {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    vm.$http.delete(`${api.property}/${wid}`).then(resp => {
                        if(resp.status === 200 && resp.data.code === '0') {
                            vm.$message.success(`删除配置信息成功。`);
                            vm.reloadTable();
                        } else {
                            vm.$message.error(`删除配置信息失败${resp.data.message}`);
                        }
                    }, fail => console.error(`%c${fail}`, 'font-style: italic;'))
                }).catch(() => vm.$message.info(`取消删除。`));
            }
        }
    }
</script>
<style scoped>
    #propertyForm .el-select {
        width: 100%;
    }
</style>