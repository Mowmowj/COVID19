---
title: COVID-19疫情大数据可视化地图项目总结
date: 2020-1-22 17:02:16
tags: JavaScript Node.js
categories: Front-End
---


## **COVID-19疫情大数据可视化地图**

### 运行方法:

1. 

   ```
   node ./server/spider.js
   //启动node爬虫采集并清洗数据
   node ./server/index.js
   //将数据用本地服务器解析 并分配8002号端口
   ```

2. 点击index.html启动网页

   ### 主要功能

    	统计全国COVID19病毒感染数据,并**实现动态数据可视化展示** 

   **优雅直观**的显示重要数据走向与差异变化,**根据鼠标或手势指向显示**不同省份详细数据

   其中包括:	

   **中国地图与感染人数映射图** 	

   (通过颜色分辨显示不同区域的人数)

   **四大重要数据直方/折线图**

   (包括现存确诊人数,累计确诊人数,死亡人数,治愈人数)

   **现存确诊人数排行前六省图**

   (爬取确诊人数排名前六的省份,并进行横向数据展示)

   

   ## 技术栈

   ​							**JS+Node.js+Express+Echarts**
   
   
   
   ## 实现方法
   
   1. 通过**node.js**配合cheerio和superagent工具编写**node爬虫**爬取丁香园网页中的文字统计数据. 使用eval方法清洗数据,使用fs工具写入
   2. 本地使用**node.js搭建本地服务器**分配端口,将数据投射到本地服务器
   3. 配置**Echarts**工具. 导入地图,导入数据,二次筛选数据.修改Echarts参数.
   4. 代码复用,加工数据展示其他统计图



 

 

## 更新与BUG修改

1. 优化显示颜色

2. 加入提示框更多内容的显示

3. 处理统计图上的显示问题

4. 丁香园,确诊人数数据改变,分为累计确诊人数和现存确诊人数, 重新筛选数据选择地图显示更为重要的现存确诊人数.

5. 加入四大重要数据图

6. 加入现存确诊人数前六省统计图

7. 修改字体超限问题

8. 由于组件更新产生server不能使用的问题 修改bug 重新上线

   

   

   

   

   

   

   

   

   

   

   ___________________________________________________________________________________________________________________________________________________________________

   ### 源码分享

   

   #### node 爬取疫情数据

   > 

   #### 使用 node 写一个简单爬虫，爬取疫情数据

   > 

9. npm安两个库

   - superagent(http://visionmedia.github.io/superagent/ ) 是个 http 方面的库，可以发起 get 或 post 请求 隐身自己是浏览器
      - cheerio(https://github.com/cheeriojs/cheerio )为服务器特别定制的，快速、灵活、实施的 jQuery. 用来从网页中以 css selector 取数据，使用方式跟 jquery 一样。

   2. 爬取丁香园网站

      ```js
      function crawlerData() {
        var targetUrl = 'https://ncov.dxy.cn/ncovh5/view/pneumonia'
        superagent
          .get(targetUrl)
          .then(result => {
          })
          .catch(err => {
         console.log(err)
          })
   }
      ```

   3. 通过 cheerios 筛选获取数据

      ```js
      let originDataObj = {}
      function evalJsStr() {
        if (arguments.length <= 0) return
        for (let i = 0; i < arguments.length; i++) {
          let params = arguments[i].replace(/window/gi, 'originDataObj')
          eval(params)
        }
      }
      const $ = cheerio.load(result.text)
      const $provinceStr = $('#getListByCountryTypeService1').html()
      const $provinceAndCityStr = $('#getAreaStat').html()
   const $getStatisticsStr = $('#getStatisticsService').html()
      evalJsStr($provinceStr, $provinceAndCityStr, $getStatisticsStr)
   console.log(originDataObj)
      ```

   4. 将爬取的 json 数据写入本地文件中存储

      ```js
      fs.writeFile(path.join(__dirname, './data.json'), JSON.stringify(originDataObj), err => {
       if (err) throw err
        console.log('数据写入成功')
   })
      ```

   5. 创建 express 服务器将爬取的数据通过接口响应

      - `yarn add express`下载 express

      - 新建`index.js`文件编写接口

        ```js
        const fs = require('fs')
        const path = require('path')
        const express = require('express')
        const cors = require('cors')
        const app = express()
        app.use(cors())
        app.get('/api/data', (req, res) => {
          fs.readFile(path.join(__dirname, './data.json'), 'utf8', (err, data) => {
            if (err) throw err
            res.send(data)
          })
        })
       app.listen(8088, () => {
          console.log('服务启动了 http://127.0.0.1:8022')
       })
        ```

   #### echarts 实现全国疫情分布图

   1. 图表背景色`backgroundColor`和标题`title`及`series`选项配置

      ```html
      <script src="echarts.js"></script>
      <script src="map/js/china.js"></script>
      <script>
        var myChart = echarts.init(document.getElementById('main'))
        myChart.setOption({
          backgroundColor: '#404a59', 
          title: {
          
            text: '',
            left: 'center',
            textStyle: {
              fontSize: 28,
              color: '#fff'
            }
          },
          series: [
            {
              type: 'map',
              map: 'china' 
            }
       ]
        })
   </script>
      ```

   2. series 选项添加数据

      ```js
      fetch('http://127.0.0.1:8002')
        .then(res => res.json())
        .then(res => {
          let listByCountry = res.getListByCountryTypeService1
          let fitlerlistByCountry = []
          for (let i = 0; i < listByCountry.length; i++) {
            let item = listByCountry[i]
            fitlerlistByCountry.push({
              name: item.provinceShortName,
              value: item.confirmedCount,
              suspectedCount: item.suspectedCount,
              deadCount: item.deadCount
            })
          }
          console.log(fitlerlistByCountry, '后台接口数据')
          myChart.setOption({
            // ...,
            series: [
              {
                type: 'map', 
                map: 'china' 
                data: fitlerlistByCountry,
                label: {
                  show: true,
                  fontSize: '10',
                  color: 'rgba(0, 0, 0, 0.7)'
                }
              }
         ]
          })
       })
      ```

   3. `tooltip`提示框组件配置

      ```js
       tooltip: {
         triggerOn: 'mousemove', 
         formatter: function(params) {
       
        return `地区：${params.name}<br/> 现存确诊人数：${params.value}<br/>疑似人数：${params.data?.suspectedCount}<br/>`
         }
    }
      ```

   4. `visualMap`是视觉映射组件配置

      ```js
       visualMap: {
         type: 'piecewise', 
         pieces: [ 
           { gte: 10000 }, 
           { gte: 1000, lte: 9999 }, 
           { gte: 100, lte: 999 }, 
           { gte: 10, lte: 99 },
           { gte: 1, lte: 9 } 
         ],
         textStyle: {
           color: '#fff'
         },
         left: 'left',
         top: 'bottom',
         text: ['高', '低'], 
         inRange: { 
           color: ['#ffaa85', '#ff7b69', '#cc2929', '#8c0d0d', '#660208']
      },
         showLabel: true 
    }
      ```

   5.编写方法,实现遍历数据求和得到总数

   ```javascripta
    function sum1(filterData) {
             var s = 0;
             for (var i=filterData.length-1; i>=0; i--) {
             s += filterData[i].value;
             }
             return s;
          }
             var value = sum1(filterData);
          //比如这里实现计算现存确诊人数
   ```

   6.继续寻找处理数据,计算出图中需要的数据

   7.调整css结构 让界面更美观.

   

   

   

   

   

   

   
