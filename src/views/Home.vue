<template>
  <van-pull-refresh @refresh="onRefresh" v-model="refresh.loading">
    <div class="home">
      <div class="theme-img">
        <img src="@/assets/images/1.png" alt />
      </div>
      <div class="phone">
        <img src="@/assets/images/2.png" alt />
        <div class="phone-content"> 
          <div>
            <h3>发薪批次：</h3>
            <p class="phone-content-date" @click="batchModelEvents('pickerShow')">{{batchModel.picker.value}}</p>
            <!-- 批次选择组件 -->
            <van-popup v-model="batchModel.picker.visible" position="bottom">
              <van-picker 
                show-toolbar title="年-月-批次号" 
                :columns="batchModel.picker.columns" 
                @confirm="batchModelEvents('pickerSure', $event)"
                @cancel="batchModelEvents('pickerClose')"
              />
            </van-popup>
          </div>
          <div>
            <h3>对接批次：</h3>
            <p>{{batchModel.batchTotal}}</p>
          </div>
          <div>
            <h3>发薪总人数：</h3>
            <p>{{batchModel.total}}</p>
          </div>
          <div>
            <h3>异常人员：</h3>
            <p>{{batchModel.abnormalSum}}</p>
          </div>
          <div>
            <h3>特殊人员：</h3>
            <p>{{batchModel.specialSum}}</p>
          </div>
        </div>
      </div>
      <div class="dq">
        <img src="@/assets/images/border.png" alt />
        <div class="dq-content">
          <h3>各大区发薪人数</h3>
          <div class="dq-content-chart" ref="dq-content-chart"></div>
        </div>
        <p class="dq-tip">备注：以上统计数据不包含黑龙江区，光大银行发薪的不纳入进度统计。</p>
      </div>
      <div class="bank">
        <div class="bank-item">
          <img src="@/assets/images/3.png" alt />
          <div class="bank-item-data">
            <h3>银行流水自动认领</h3>
            <p>{{bankFlow.autoClaim}}笔</p>
            <h3>占比</h3>
            <p>{{bankFlow.autoClaimProportion}}%</p>
          </div>
        </div>
        <div class="bank-item">
          <div class="bank-item-data">
            <h3>银行流水自动调拨</h3>
            <p>{{bankFlow.autoAllot}}笔</p>
            <h3>占比</h3>
            <p>{{bankFlow.autoAllotProportion}}%</p>
          </div>
          <img src="@/assets/images/4.png" alt />
        </div>
      </div>
      <div class="progress">
        <img src="@/assets/images/5.png" alt="">
        <div class="progress-qw">
          <h3>发薪进度-全网</h3>
          <div class="progress-qw-chart">
            <div class="progress-qw-chart-info">
              <p class="font-cool">截止当前</p>
              <p>推送<span>{{paybyQW.pushSum}}</span>批次</p>
              <p class="font-cool">推送成功</p>
              <p><span>{{paybyQW.paySuccessSum}}</span>人</p>
            </div>
            <div class="progress-qw-chart-pie" ref="progress-qw-chart-pie"></div>
          </div>
        </div>
        <div class="progress-dq">
          <h3>发薪进度-大区</h3>
          <p>各大区当前推送发薪情况</p>
          <div class="progress-dq-chart" ref="progress-dq-chart"></div>
        </div>
      </div>
      <div class="region">
        <table class="region-table">
          <caption>发薪进度-地区</caption>
          <thead>
            <tr>
              <th>大区</th>
              <th>地区</th>
              <th>发薪成功</th>
              <th>待发薪</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in paybyDIQU.table" :key="index">
              <td>{{item.preOrganizationName}}</td>
              <td>{{item.organizationalName}}</td>
              <td>{{item.paySuccessSum}}</td>
              <td>{{item.awaitSum}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </van-pull-refresh>
</template>

<script>
const SUCCESS_COLOR = '#91cc75';
const DANGER_COLOR = '#ee6666';
const WARNING_COLOR = '#fac858';
const PRIMARY_COLOR = '#5069f9';

export default {
  data() {
    return {
      refresh: {
        loading: false
      },
      batchModel: {
        month: '202011',
        payrollBatch: '18',
        batchTotal: 0, // 对接批次
        total: 0, // 发薪总人数
        abnormalSum: 0, // 异常人数
        specialSum: 0, // 特殊人数
        picker: {
          visible: false,
          value: '2020年11月/18号批次',
          columns: [
            // 第一列
            {
              values: [2018,2019,2020,2021,2022,2023],
              defaultIndex: 2,
            },
            // 第二列
            {
              values: [1,2,3,4,5,6,7,8,9,10,11,12],
              defaultIndex: 10,
            },
            // 第三列
            {
              values: [5,10,15,18,20,25],
              defaultIndex: 3,
            },
          ]
        },
      },
      personCoutByOrg: {
        chart: null,
        config: {
          legend: { data: ["人数"] },
          xAxis: { data: [] },
          yAxis: { show: false },
          series: [
            {
              name: "人数",
              type: "bar",
              label: {
                show: true,
                position: 'top'
              },
              data: []
            },
          ]
        }
      },
      bankFlow: {
        autoClaim: 0, // 银行流水自动认领皮次数
        autoAllot: 0, // 自动调拨批次数
        autoClaimProportion: 0, // 占比
        autoAllotProportion: 0, // 占比
      },
      paybyQW: {
        chart: null,
        pushSum: 0,
        paySuccessSum: 0,
        config: {
          legend: { 
            orient: 'horizontal',
            data: ['成功', '失败', '待发', '发薪中']
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)'
          },
          series: [
            {
              bottom: -40,
              name: '人数统计',
              type: 'pie',
              label: {
                normal: {
                  show:true,
                  position: 'inside',
                  formatter: '{c}'
                }
              },
              itemStyle: {
                normal: {
                  label: { show: false },
                  labelLine: { show: false },
                },
              },
              data: []
            }
          ]
        }
      },
      paybyDaQu: {
        chart: null,
        config: {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          legend: {
            data: ['发薪成功', '发薪失败', '待发薪', '发放中']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '0',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              data: []
            }
          ],
          yAxis: [
            {
              type: 'value',
              name: '人数',
            }
          ],
          series: [
            {
              name: '发薪成功',
              type: 'bar',
              stack: '发放状态',
              itemStyle: { color: SUCCESS_COLOR },
              data: []
            },
            {
              name: '发薪失败',
              type: 'bar',
              stack: '发放状态',
              itemStyle: { color: DANGER_COLOR },
              data: []
            },
            {
              name: '待发薪',
              type: 'bar',
              stack: '发放状态',
              itemStyle: { color: WARNING_COLOR },
              data: []
            },
            {
              name: '发放中',
              type: 'bar',
              stack: '发放状态',
              itemStyle: { color: PRIMARY_COLOR },
              data: []
            }
          ],
        }
      },
      paybyDIQU: {
        table: []
      }
    };
  },
  created() {
    this.getData();
  },
  mounted() {
    this.chartsResize();
  },
  methods: {
    onRefresh() {
      this.refresh.loading = false;
      this.getData();
    },
    async getData() {
      const { month, payrollBatch } = this.batchModel;
      const res = await this.$api.home.settlementCount({ data: { month, payrollBatch } });
      const { code, data } = res;
      for (const key in data) {
        if (data[key] === null && key !== 'countInfo') {
          data[key] = 0
        }
      }
      console.log(res, '结果');
      this.batchModelEvents('init', data);
      this.personCoutByOrgEvents('setData', data.countInfo)
      this.bankFlowEvents(data);
      this.paybyQWEvents('setData', data);
      this.paybyDaQuEvents('setData', data.countInfo);
      this.paybyDIQUEvents(data.countInfo)
    },
    /**
     * 人员统计的事件
     * @param {string} event 事件名称
     * @param {string} values 对应的值
     */
    batchModelEvents(event, values) {
      let batchModel = this.batchModel;
      const pickerShow = () => {
        batchModel.picker.visible = true
      }
      const pickerClose = () => {
        batchModel.picker.visible = false
      }
      const pickerSure = () => {
        let [ year, month, day ] = values;
        month < 10 && ( month = '0' + month )
        day < 10 && ( day = '0' + day )
        batchModel.picker.value = `${year}年${month}月/${day}号批次`
        this.batchModel = {
          ...batchModel,
          month: '' + year + month,
          payrollBatch: day
        }
        this.getData();
        pickerClose();
      }
      const init = () => {
        const { batchTotal, total, abnormalSum, specialSum } = values;
        this.batchModel = { ...batchModel, batchTotal, total, abnormalSum, specialSum } 
      }
      ({pickerShow, pickerClose, pickerSure, init}[event]())
    },
    // 各大区发薪人数
    personCoutByOrgEvents(event, values) {
      const init = () => {
        this.personCoutByOrg.chart = this.$echarts.init(this.$refs['dq-content-chart']);
        draw();
      };
      const draw = () => {
        this.personCoutByOrg.chart.setOption({...this.personCoutByOrg.config});
      };
      const setData = () => {
        // x轴
        const x_name = ['华北大区', '华南大区', '中西大区', '华东大区'];
        const config = this.personCoutByOrg.config;
        const list = values.filter(item => x_name.includes(item.organizationalName));        
        config.xAxis.data = list.map(item => item.organizationalName);
        config.series[0].data = list.map(item => item.total);
        init();
      };
      ({init, draw, setData}[event]())
    },
    // 银行流水
    bankFlowEvents(values) {
      const { autoClaim, autoAllot, batchTotal } = values;
      let autoClaimProportion = 0,  autoAllotProportion = 0;
      if ( batchTotal !== 0 ) {
        autoClaimProportion = ((autoClaim / batchTotal) * 100).toFixed(2);
        autoAllotProportion = ((autoAllot / batchTotal) * 100).toFixed(2);
      }
      this.bankFlow = {
        ...this.bankFlow,
        autoClaim,
        autoAllot,
        autoClaimProportion,
        autoAllotProportion
      }
    },
    // 发薪进度-全网饼图
    paybyQWEvents(event, values) {
      const init = () => {
        this.paybyQW.chart = this.$echarts.init(this.$refs['progress-qw-chart-pie']);
        draw();
      };
      const draw = () => {
        this.paybyQW.chart.setOption({...this.paybyQW.config});
      };
      const setData = () => {
        const { paySuccessSum, payingSum, payFailSum, awaitSum, pushSum } = values;
        // 设置饼图
        const config = this.paybyQW.config;
        const list = [];
        const OBJ = { paySuccessSum, payingSum, payFailSum, awaitSum };
        const NAME = { paySuccessSum: '成功',  payFailSum: '失败', awaitSum: '待发', payingSum: '发薪中' };
        const COLOR = { paySuccessSum: SUCCESS_COLOR, payFailSum: DANGER_COLOR, awaitSum: WARNING_COLOR, payingSum: PRIMARY_COLOR };
        for (const key in OBJ) {
          list.push({name: NAME[key], value: OBJ[key], itemStyle: { color: COLOR[key]} })
        };
        config.series[0].data = list;
        // 设置左边数据
        this.paybyQW = {
          ...this.paybyQW,
          paySuccessSum,
          pushSum
        }
        init();
      };
      ({init, draw, setData}[event]())
    },
    // 发薪进度-大区
    paybyDaQuEvents(event, values) {
      const init = () => {
        this.paybyDaQu.chart = this.$echarts.init(this.$refs['progress-dq-chart']);
        draw();
      };
      const draw = () => {
        this.paybyDaQu.chart.setOption({...this.paybyDaQu.config});
      };
      const setData = () => {
        const x_name = ['华北大区', '华南大区', '中西大区', '华东大区'];
        const config = this.paybyDaQu.config;
        // 找到规定的四个大区数据
        const list = values.filter(item => x_name.includes(item.organizationalName));   
        // 柱状图筛选数据
        config.xAxis[0].data = list.map(item => item.organizationalName);
        let success = [], fail = [], awaitSum = [], playing = [];
        list.forEach(item => {
          success.push(item.paySuccessSum);
          fail.push(item.payFailSum);
          awaitSum.push(item.awaitSum);
          playing.push(item.payingSum);
        })
        const status = [success, fail, awaitSum, playing];
        config.series.forEach((item, index) => {
          item.data = status[index];
        })
        init();
      };
      ({init, draw, setData}[event]())
    },
    // 发薪进度-地区
    paybyDIQUEvents(values) {
      this.paybyDIQU.table = [];
      const DQ = ['华北大区', '华南大区', '中西大区', '华东大区'];
      const list = values.filter(item => !DQ.includes(item.organizationalName));
      list.forEach(item => {
        const { organizationalName, preOrganizationName, paySuccessSum, awaitSum } = item;
        this.paybyDIQU.table.push({organizationalName, preOrganizationName, paySuccessSum, awaitSum});
      });
    },
    // echarts适应屏幕大小改变
    chartsResize() {
      window.onresize = () => {
        ['personCoutByOrg', 'paybyQW', 'paybyDaQu'].forEach(key => {
          this[key].chart.resize();
        })
      }
    }
  }
};
</script>

<style lang="less" scoped>
@font-color: #636567;
@theme-color: #5069f9;
@white-color: #fff;
@yellow-color: #f3c461;

.font-cool {
  color: @font-color;
  font-weight: bold;
  font-size: 18px;
}
.home {
  overflow: hidden;
  background: @theme-color;
}
.theme-img, .phone, .dq, .bank, .progress {
  img {
    width: 375px;
  }
}
.phone {
  position: relative;
  &-content {
    position: absolute;
    top: 20px;
    left: 114px;
    padding: 12px;
    box-sizing: border-box;
    overflow: scroll;
    width: 175px;
    height: 290px;
    // border: 1px solid red;
    font-size: 14px;
    font-weight: bold;
    color: @theme-color;
    h3 {
      color: @font-color;
      font-weight: normal;
    }
    &-date {
      font-weight: bold;
      text-decoration:underline;
    }
    & > div {
      margin-bottom: 10px;
    }
  }
}
.dq {
  position: relative;
  padding: 0 20px 0 40px;
  height: 300px;
  img {
    height: 260px;
  }
  box-sizing: border-box;
  color: @font-color;
  &-content {
    position: absolute;
    top: 10px;
    left: 5px;
    box-sizing: border-box;
    font-size: 14px;
    padding: 10px;
    h3 {
      text-align: center;
    }
    &-chart {
      margin-top: 15px;
      width: 370px;
      height: 210px;
    }
  }
  &-tip {
    font-size: 12px;
    padding: 5px;
    color: #ffe1cf;
  }
}
.bank {
  margin-top: 20px;
  &-item {
    display: flex;
    padding: 0 10px;
    margin-bottom: 40px;
    &:nth-of-type(1) {
      text-align: right;
    }
    img {
      flex: 0.5;
    }
    &-data {
      flex:0.5;
      h3 {
        color: @white-color;
        font-weight: normal;
        white-space: nowrap;
      }
      p {
        color: @yellow-color;
        font-size: 30px;
      }
      & > h3:nth-of-type(2) {
        margin-top: 20px;
      }
    }
  }
}
.progress {
  position: relative;
  box-sizing: border-box;
  padding: 0 15px;
  &-qw {
    position: absolute;
    width: 345px;
    top: 80px;
    border-bottom: 1px solid @font-color;
    h3 {
      margin-bottom: 15px;
      text-align: center;
    }
    &-chart {
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding-left: 15px;
      &-info {
        line-height: 40px;
        color: @font-color;
        span {
          font-size: 20px;
          font-weight: bold;
          color: @theme-color;
        }
      }
      &-pie {
        width: 210px;
        height: 210px;
      }
    }
  }
  &-dq {
    position: absolute;
    width: 345px;
    bottom: 0;
    border-bottom: 1px solid @font-color;
    h3, p {
      text-align: center;
    }
    &-chart {
      width: 345px;
      height: 200px;
    }
  }
}
.region {
  margin: 20px auto;
  width: 345px;
  border-radius: 10px;
  border: 4px solid @yellow-color;
  background: @white-color;
  &-table {
    border-collapse: collapse;
    width: 338px;
    caption {
      font-size: larger;
      margin: 10px auto;
      font-weight: bold;
    }
    th,td {
     padding: 10px;
     text-align: center;
    }
    th {
      background: @font-color nonerepeat scroll 0 0;
      border: 1px solid @font-color;
      color: @theme-color;
    }
    td {
     border: 1px solid @font-color;
    }
  }
}
</style>