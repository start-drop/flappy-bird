
var bird = {
    skyDis : 0,
    birdDis : 0,
    birdStep : 0,
    skyStep : 2,
    birdTop : 235,
    curClass : 'small',
    cout : 0,
    maxTop : 570,
    pauseFlag : false,
    pipeNum : 7,
    pipeHeight : 450,
    pipeArr : [],
    pipeLastIndex : 6,
    curscore : 0,
    rankArr : [],
    initData : function(){
        this.bird = document.getElementsByClassName('bird')[0];
        this.word = document.getElementsByClassName('start-game')[0];
        this.sky = document.getElementsByClassName('contain')[0];
        this.gameScore = document.getElementsByClassName('game-score')[0];
        this.mask = document.getElementsByClassName('mask')[0];
        this.pipes = document.getElementsByClassName('pipe');
        this.rankList = document.getElementsByClassName('ranking-list')[0];
        this.restart = document.getElementsByClassName('restart')[0];
        this.score = document.getElementsByClassName('score')[0];
        this.rankArr = this.getScore();
    },
    getScore : function(){
        var scoreArr = this.getLocal('score');
        return scoreArr ? scoreArr : [];
    },
    init : function(){
        this.initData();
        this.startGame();
        this.handleClick();
        this.handleRestart();
        if(sessionStorage.getItem('play')) {
            this.start();
          }
        this.timer = setInterval(()=>{
            this.skyMove();
            if(this.pauseFlag){
                this.birdDrop();
                this.movePipe();
            }
            if(this.cout % 3 == 0 )this.birdFly();
            if(this.cout++ % 10 == 0){
                if(!this.pauseFlag){
                    this.wordScale();
                    this.birdJump(); 
                }
            }
        },30)
    },
    skyMove : function(){
        this.skyDis -= this.skyStep;
        this.sky.style.backgroundPosition = this.skyDis + 'px';
    },
    birdJump : function(){
        this.birdTop = this.birdTop === 220 ? 260 : 220;
        this.bird.style.top = this.birdTop + 'px';
    },
    birdFly : function(){
        this.birdDis -= 30;
        this.bird.style.backgroundPosition = this.birdDis + 'px';
    },
    //开始游戏文字动画放大缩小，同时改变文本颜色
    wordScale : function(){
        var pre = this.curClass;
        this.curClass = pre === 'big'? 'small' : 'big';
        this.word.classList.remove(pre);
        this.word.classList.add(this.curClass);
    },
    //点击开始游戏事件
    startGame : function(){
        this.word.onclick = () => {
            this.start();
        }
    },
    //点击开始游戏，初始化游戏界面
    start : function(){
        this.word.style.display = 'none';
        this.gameScore.style.display = 'block';
        this.pauseFlag = true;
        this.bird.style.left = '80px';
        this.bird.style.transition = 'none';  
        for(var i = 0;i < this.pipeNum;i++){
            this.addPipe(300 * (i + 1));
        }
    },

    birdDrop : function(){
        this.birdTop += ++this.birdStep;
        this.bird.style.top = this.birdTop + 'px';
        this.judgeBoundary();
        this.judgePipe();
        this.addScore();
    },
    //同步屏幕中间分数
    addScore : function(){
        var index = this.curscore % this.pipeNum;
        
        var left = this.pipeArr[index].up.offsetLeft;
        if(left < 13){
            this.gameScore.innerText = ++this.curscore;
        }
    },
    //判断小鸟是否撞到天上或地下
    judgeBoundary : function(){
        if(this.birdTop <= 0 || this.birdTop >= this.maxTop) 
            this.gameOver();
    },
    //判断小鸟是否撞到柱子
    judgePipe : function(){
        var pipe = this.pipeArr[this.curscore % (this.pipeNum)];
        var left = pipe.up.offsetLeft;
        var top = this.birdTop;
        var maxTop = pipe.top + 150 - 15;
        if(left <= 95 && left >= 13 && (top <= pipe.top || top >= maxTop)){
            this.gameOver();
        }
    },
    //游戏结束
    gameOver : function(){
        // console.log('die')
        clearInterval(this.timer);
        this.mask.style.display = 'block';
        this.gameScore.style.display = 'none';
        this.score.innerText = this.curscore;
        this.setRankArr();
        this.setLocal('score',this.rankArr);
        this.createRankList();
    },
    //将数据放到数组并进行处理
    setRankArr : function(){
        //将游戏结果插入数组
        this.rankArr.push({
            score : this.curscore,
            time : this.getDate(),
            millTime : new Date().getTime()
        }) 
        //数组排序，高分在前，低分在后，相同分数，则玩的游戏时间靠近当前时间的在前
        this.rankArr.sort((a,b) => {
            return b.score !== a.score ? b.score - a.score : b.millTime - a.millTime;
        })
    },
    //将结果存储到本地
    setLocal : function (key, value) {
        if(typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }
      
        localStorage.setItem(key, value);
      },
    //根据键值，从本地获取数据返回
    getLocal : function (key) {
        var value = localStorage.getItem(key);
        if(value === null) { return null};
        if(value[0] === '[' || value[0] === '{') {
          return JSON.parse(value);
        }
        return value;
      },
    //格式化当前游戏结束时间
    getDate : function(){
        var date = new Date();
        var time = date.toTimeString().split(' ')[0];
        var d = date.getFullYear() + '.' + (date.getMonth() + 1) + '.' + (date.getDate())
        return d + ' ' + time;
    },
    //创建排行榜
    createRankList : function(){
        var template = '';
        for(var i = 0;i < this.rankArr.length && i < 8; i++){
            var degree = '';
            switch(i){
                case 0 : degree = 'first';break;
                case 1 : degree = 'second';break;
                case 2 : degree = 'third';break;
                default : break;
            }
            template += `
            <li class="ranking-item">
                <span class="ranking-number ${degree}">${i+1}</span>
                <span class="ranking-score">${this.rankArr[i].score}</span>
                <span class="ranking-time">${this.rankArr[i].time}</span>
            </li>`
        }
        this.rankList.innerHTML = template;
    },
    //点击重新开始事件
    handleRestart : function(){
        this.restart.onclick = function () {
            sessionStorage.setItem('play', true);
            window.location.reload();
          };
    },
    //点击屏幕，控制小鸟的位置
    handleClick : function(){
        var self = this;
        this.sky.onclick = function(e){
            var isStart = e.target.classList.contains('start-game');
            if(!isStart) {
                self.birdStep = -10; 
            }
        }
    },
    //使柱子移动
    movePipe : function(){
        this.pipeArr.forEach((pipeObj,index) => {
            var left = pipeObj.up.offsetLeft - this.skyStep;
            if(left < -52){
                var pipeleft = this.pipeArr[this.pipeLastIndex].up.offsetLeft + 300;
                pipeObj.up.style.left = pipeleft + 'px';
                pipeObj.down.style.left = pipeleft + 'px';
                this.pipeLastIndex = index;
                return;
            }
            pipeObj.up.style.left = left + 'px';
            pipeObj.down.style.left = left + 'px';
        })
    },
    //设置柱子位置及高度，并将其添加到容器中
    addPipe : function(x){
        //50 - 225
        var upHeight = Math.floor(175 * Math.random()) + 50;
        var downHeight = this.pipeHeight - upHeight;
        var upDom = this.createPipe('div',['pipe','pipeUp'],{
            left : x + 'px',
            height : upHeight + 'px' 
        })
        var downDom = this.createPipe('div',['pipe','pipeDown'],{
            left : x + 'px',
            height : downHeight + 'px'
        })
        this.sky.appendChild(upDom);
        this.sky.appendChild(downDom);
        this.pipeArr.push({
            up : upDom,
            down : downDom,
            top : upHeight,
        })
    },
    //创建柱子
    createPipe : function(eleName,classList,styleObj){
        var dom = document.createElement(eleName);
        classList.forEach((item) => {
            dom.classList.add(item);
        })
        for(var key in styleObj){
            dom.style[key] = styleObj[key];
        }
        return dom;
    }

}
bird.init();