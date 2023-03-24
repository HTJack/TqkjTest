function aotoSlide(operation, type='',) {
    clearInterval(timeId2);
    // 点击的时候，operation为点击的索引
    currentIndex = type==='click'? operation: currentIndex+operation;
    let ul = document.querySelector('.slide-show-wrap ul');
    toLast = false;
    toFirst = false;
    // 点击过快有大于或少于索引的现象出现
    currentIndex = currentIndex < 0? 0: currentIndex;
    currentIndex = currentIndex > 6? 6: currentIndex;
    if(currentIndex<1) {
        toLast = true;
    } else if(currentIndex>5) {
        toFirst = true;
    }

    let currentImg = document.querySelectorAll('.current-wrap img');
    for(let i=0; i<currentImg.length; i++) {
        // 第一张跟倒数第二张一叶
        // 最后一张跟第二张一样
        let srcVal = '';
        if (i===currentIndex-1 || (i===0&&currentIndex===6) || (i===currentImg.length-1&&currentIndex===0)){
            srcVal = './img/active.jpg';
        }else {
            srcVal = './img/normal.jpg';
        }
        currentImg[i].src = srcVal;
    }
    
    let slideOuterOffsetWidth = document.querySelector('.slide-show-wrap .slide-outer').offsetWidth
    let targetVal = -slideOuterOffsetWidth*currentIndex;
    
    timeId2 = setInterval(function(){
        // 一开始ul.style.left的值为空，与现实不符
        let ulLeft = parseInt(ul.style.left || -slideOuterOffsetWidth);
        // 变速运动
        let stepVal = targetVal != ulLeft? parseInt((targetVal - ulLeft) / 2) :0;
        ul.style.left = stepVal +  ulLeft + 'px';
        if ((stepVal>=0&& ulLeft>= targetVal) || (stepVal<=0&& ulLeft<= targetVal)) {
            ul.style.left =  targetVal + 'px';
            // 拉到最后一张
            if(toLast) {
                currentIndex = 5;
                ul.style.left = -slideOuterOffsetWidth*5 + 'px';
            }
            // 拉到第一张
            if (toFirst) {
                currentIndex = 1;
                ul.style.left = -slideOuterOffsetWidth + 'px';
            }
            clearInterval(timeId2);
        }
    }, 30)
}

let timeId2 = null;
let arrowA = document.querySelectorAll('.slide-show-wrap .arrow-wrap a');
let currentIndex = 1;
let toFirst = false;
let toLast = false;
for(let i=0; i<arrowA.length; i++) {
    arrowA[i].addEventListener('click',function(){
        aotoSlide(parseInt(arrowA[i].getAttribute('data-operation')));
    })
}

// 自动轮播
let timeId3 = null;
function toSlide(){
    clearInterval(timeId3);
    timeId3 = setInterval(function(){
        aotoSlide(1);
    }, 2000)
}
toSlide();

// 点击显示当前轮播叶
let currentA = document.querySelectorAll('.current-wrap a');
for(let i=0; i<currentA.length; i++) {
    currentA[i].addEventListener('click',function(){
        aotoSlide(parseInt(currentA[i].getAttribute('data-index')), 'click');
    })
}

// 鼠标移入停止轮播
let slideOuter = document.querySelector('.slide-outer');
slideOuter.addEventListener('mouseenter',function(){
    clearInterval(timeId3);
})
// 鼠标移出接着轮播
slideOuter.addEventListener('mouseleave',function(){
    toSlide();
})

// 导航栏滑块滑动效果
let timeId = null;
let navA = document.querySelectorAll('.nav-list li a');
let hasClick = false;
function sliderAction(navA, type) {
    if (type=='click'|| !hasClick) {
        hasClick = type=='click'
        let slider = document.querySelector('.nav-wrap .slider');
        let targetVal = type==='mouseleave'? 0: navA.offsetLeft;
    
        clearInterval(timeId);
        timeId = setInterval(function(){
            let sliderOffsetLeft = slider.offsetLeft;
            let stepVal = targetVal != sliderOffsetLeft? parseInt((targetVal - sliderOffsetLeft) / 2) :0;
            slider.style.left = stepVal +  slider.offsetLeft + 'px';
            slider.style.width = targetVal===0?document.querySelectorAll('.nav-list li a')[0].offsetWidth + 'px':navA.offsetWidth + 'px';
            if ((stepVal>=0&& slider.offsetLeft>= targetVal) || (stepVal<=0&& slider.offsetLeft<= targetVal)) {
                slider.style.left = targetVal + 'px';
                clearInterval(timeId);
            }
        }, 30)
    }
}

for(let i=0; i<navA.length; i++) {
    navA[i].addEventListener('mouseenter',function(){
        sliderAction(navA[i], 'mouseenter', navA[i].offsetLeft)
    })
    navA[i].addEventListener('mouseleave',function(){
        sliderAction(navA[i],'mouseleave')
    })
    navA[i].addEventListener('click',function(){
        sliderAction(navA[i],'click')
    })
}

// 渲染echarts图表
function initchart(params) {
    let echartDom = document.getElementById(params.idName);
    let echart = echarts.init(echartDom);
    params.option && echart.setOption(params.option);
}

function getDataByParams(request, params) {
    new Promise(function(resolve, reject){
        let ajax;
        if (window.XMLHttpRequest){
            ajax=new XMLHttpRequest();
        } else {
            ajax=new ActiveXObject("Microsoft.XMLHTTP");
        }
        ajax.open(request.method, request.url, true);
        if (request.method==='POST') {
            ajax.send();
        } else {
            ajax.send(request.params);
        }
        ajax.onreadystatechange=function(){
            if (ajax.readyState==4 && ajax.status==200){
                resolve(ajax.responseText);
            }
        }
    }).then(function(result){
        let res = JSON.parse(result)
        if (res.code === 200) {
            let series = res.data.series;
            let xAxis = res.data.xAxis;
            if (request.type==='pie') {
                let seriesData = params.option.series[0].data
                for(let i=0; i< series.length; i++) {
                    seriesData[i].value = series[i];
                    seriesData[i].name = xAxis[i];
                }
                params.option.series[0].data = seriesData;
            }else if (request.type==='bar') {
                params.option.series[0].data = res.data.series;
                params.option.xAxis.data = res.data.xAxis;
            }
            initchart(params)
        }
    })
    
}

getDataByParams({
    method: 'GET',
    url: 'https://edu.telking.com/api/?type=month',
    type: 'line'
},{
    idName: 'line-chart-wrap',
    option: {
        title: {
            text: '曲线图数据图展示',
            textStyle: {
                fontWeight: 'normal',
            },
            left: 'center',
        },
        tooltip: {
            trigger: 'item'
        },
        xAxis: {
            type: 'category',
            data: ['01/26', '01/27', '01/28', '01/29', '01/30', '01/31', '02/01', '02/02', '02/03', '02/04', '02/05', '02/06', '02/07', '02/08', '02/09', '02/10', '02/11', '02/12', '02/13', '02/14', '02/15', '02/16', '02/17', '02/18', '02/19', '02/20', '02/21', '02/12', '02/23'],
            axisLine: {
                show: false,
            },
            axisLabel: {
                color: '#373737',
                formatter: function (value, index) {
                    return index%2===0?value:'';
                }
            },
            axisTick: {
                show: false,
            }, 
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: '#373737',
                formatter: '{value} 人'
            },
            splitLine: {
                lineStyle: {
                    color: ['#CCCCCC'],
                    type: 'dashed'
                }
            },
        },
            series: [
            {
                data: [8972, 4000, 6448, 8650, 7456, 2400, 5824, 3500, 8123, 4212, 300, 6600, 300, 8600, 5319,  9600, 7463,  8700, 1435,  5430, 9426,  6400, 8187,  6400, 8297, 443,  4370, 9135, 9135],
                type: 'line',
                lineStyle: {
                    color: '#4486EF',
                },
                smooth: true,
                areaStyle: {
                    color: '#F3F7FE'
                },
            }
            ]
    }
})

getDataByParams({
    method: 'GET',
    url: 'https://edu.telking.com/api/?type=week',
    type: 'pie'
},{
    idName: 'pie-chart-wrap',
    option: {
        title: {
            text: '饼状图数据图展示',
            textStyle: {
                fontWeight: 'normal',
            },
            left: 'center',
        },
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            type: 'pie',
            radius: '70%',
            data: [
                { 
                    value: 50, 
                    name: 'Mon',
                    itemStyle:{
                        color: '#C03636'
                    } 
                },
                { 
                    value: 40, 
                    name: 'Tue',
                    itemStyle:{
                        color: '#2F4553'
                    } 
                },
                { 
                    value: 30, 
                    name: 'Web',
                    itemStyle:{
                        color: '#64A1A8'
                    } 
                },
                { 
                    value: 20, 
                    name: 'Thu',
                    itemStyle:{
                        color: '#D28268'
                    } 
                },
                { 
                    value: 250, 
                    name: 'Fri',
                    itemStyle:{
                        color: '#92C7AF'
                    } 
                },
                { 
                    value: 200, 
                    name: 'Sat',
                    itemStyle:{
                        color: '#759E84'
                    } 
                },
                { 
                    value: 230, 
                    name: 'Sun',
                    itemStyle:{
                        color: '#C9852F'
                    } 
                }
            ],
          }
        ]
    }
})

getDataByParams({
    method: 'GET',
    url: 'https://edu.telking.com/api/?type=week',
    type: 'bar'
},{
    idName: 'bar-chart-wrap',
    option: {
        title: {
            text: '柱状图数据图展示',
            textStyle: {
                fontWeight: 'normal',
            },
            left: 'center',
        },
        tooltip: {
          trigger: 'item'
        },
        xAxis: {
            type: 'category',
            axisLine: {
                show: false,
            },
            axisLabel: {
                color: '#373737'
            },
            axisTick: {
                show: false,
            }, 
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
            type: 'value',
            name: '商品数',
            nameTextStyle: {
                color: '#343434'
            },
            axisLabel: {
                color: '#373737'
            },
            splitLine: {
                lineStyle: {
                    color: ['#CCCCCC'],
                    type: 'dashed'
                }
            },
        },
        series: [
            {
              type: 'bar',
              barWidth: '16px',
              data: [9, 11, 13, 10, 8, 11, 5],
              itemStyle: {
                  color: '#4587F0'
              }
            }
        ]
    }
})
