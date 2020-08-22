function Bird(){
    this.skyStep = 2;
    this.skyLeft = 0;
    this.birdPosition = 0;
    this.cout = 0;
    this.birdTop = 235;
    this.startFlag = false;
    this.birdDropSpeed = 4;

    this.pipeNum = 7;
    this.pipeArr = [];
    this.lastIndexPipe = 6;
    this.curscroe = 0;

    this.rankArr = []
}
Bird.prototype.init = function(){
    this.setRankArr();
    this.clickHandle();
    if(sessionStorage.getItem('played') === 'true'){
        $('.start-game').trigger('click');
    }
    this.timer = setInterval(() => {
        this.moveSky();
        if(this.startFlag){
            this.movePipe();
            this.birdDrop();
        }
        if(this.cout++ % 3 == 0)this.birdFly();
        if(this.startFlag === false && this.cout % 10 == 0){
            this.birdJump();
            this.wordScale();
        }
        
    },30)
}
Bird.prototype.setRankArr = function(){
    var arr = this.getLocal('score');
    this.rankArr = arr ? arr : [];
}
Bird.prototype.getLocal = function(key){
    var value = localStorage.getItem(key);
    console.log(value)
    if(value === null)return null;
    if(value[0] === "[" || value[0] === "{"){
        return JSON.parse(value);
    }
    return value;
}
Bird.prototype.moveSky = function(){
    this.skyLeft -= this.skyStep;
    $('.contain').css('backgroundPosition',this.skyLeft + 'px');
}
Bird.prototype.birdFly = function(){
    this.birdPosition -= 30;
    $('.bird').css('backgroundPosition',this.birdPosition + 'px');
}
Bird.prototype.birdJump = function(){
    this.birdTop = this.birdTop === 260 ? 220 : 260;
    $('.bird').css('top',this.birdTop + 'px');
}
Bird.prototype.birdDrop = function(){
    this.birdTop += this.birdDropSpeed++;
    $('.bird').css('top',this.birdTop + 'px');
    this.dropBoundary();
    this.knockPipe();
    this.addScore();
}
Bird.prototype.addScore = function(){
    var ele = this.pipeArr[this.curscroe % this.pipeNum];
    var left = ele.up[0].offsetLeft;
    if(left < 13){
        $('.game-score').text(++this.curscroe);
        console.log(this.curscroe)
    }
}
Bird.prototype.dropBoundary = function(){
    if(this.birdTop <= 0 || this.birdTop >= 570){
        this.gameOver();
    }
}
Bird.prototype.knockPipe = function(){
    var ele = this.pipeArr[this.curscroe % this.pipeNum];
    var left = ele.up[0].offsetLeft;
    var height = ele.height;
    var maxHeight = height + 150 - 30;
    if(left <= 95 && left >= 13 && (this.birdTop <= height || this.birdTop >= maxHeight)){
        this.gameOver();
    }
}
Bird.prototype.gameOver = function(){
    console.log('die');
    clearInterval(this.timer);
    $('.mask').css('display','block');
    $('.score').text(this.curscroe);
    this.sortRank();
    this.setLocal('score',this.rankArr);
    this.createRankList();
}
Bird.prototype.setLocal = function(key,value){
    if(typeof value === "object" && value !== null){
        value = JSON.stringify(value);
    }
    console.log('set',value);
    localStorage.setItem(key,value);
}
Bird.prototype.sortRank = function(){
    this.rankArr.push({
        score : this.curscroe,
        time : this.getTime(),
        millTime : new Date().getTime()
    })
    this.rankArr.sort((a,b) => {
        return a.score !== b.score ? b.score - a.score : b.millTime - a.millTime;  
    })
}
Bird.prototype.createRankList = function(){
    var template = '';
    for(var i = 0 ;i < this.rankArr.length && i < 8;i++){
        var degree = '';
        switch(i){
            case 0 : degree += 'first';break;
            case 1 : degree += 'second';break;
            case 2 : degree += 'third';break;
        }
        template += `
    <li class="ranking-item">
        <span class="ranking-number ${degree}">${i+1}</span>
        <span class="ranking-score">${this.rankArr[i].score}</span>
        <span class="ranking-time">${this.rankArr[i].time}</span>
    </li>`
    }
    $(template).appendTo('.ranking-list');
}
Bird.prototype.getTime = function(){
    var date = new Date();
    var time = date.toTimeString().split(' ')[0];
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return `${year}.${month}.${day} ${time}`;
}
Bird.prototype.wordScale = function(){
    $('.start-game').toggleClass('big');
}

Bird.prototype.clickHandle = function(){
    $('.start-game').click(() => {
        $('.start-game').css('display','none');
        $('.game-score').css('display','block');
        this.startFlag = true;
        $('.bird').css({
            'transition' : 'none',
            'left' : '80px',
        })
        for(var i = 0 ;i < this.pipeNum ;i++){
            this.addPipe(300 * (i+1));
        }
    })

    $('.start').click((e) => {
        if(!e.target.className.includes('start-game')){
            this.birdDropSpeed = -10;
            $('.bird').css('top',this.birdTop + 'px');
        }
    })

    $('.restart').click(() => {
        console.log('ture')
        sessionStorage.setItem('played',true);
        window.location.reload();
    })
}

Bird.prototype.movePipe = function(){
    this.pipeArr.forEach((obj,index) => {
        var up = obj.up;
        var down = obj.down;
        var left = up[0].offsetLeft - this.skyStep;
        if(left <= -52){
            var left = this.pipeArr[this.lastIndexPipe].up[0].offsetLeft
            $(up).css('left',left + 300 + 'px');
            $(down).css('left',left + 300 + 'px');
            this.lastIndexPipe = index;
            return;
        }
        $(up).css('left',left + 'px');
        $(down).css('left',left + 'px');
    })
}
Bird.prototype.addPipe = function(left){
    var upHeight = Math.floor(Math.random() * 175 + 50);
    var downHeight = 450 - upHeight;
    var uppipe = this.createPipe('div',['pipe','pipeUp'],
    {'height':upHeight,
     'left' : left + 'px'
    });
    var downpipe = this.createPipe('div',['pipe','pipeDown'],
    {'height':downHeight,
    'left' : left + 'px'
    });
    $('.start').append(uppipe);
    $('.start').append(downpipe);
    
    this.pipeArr.push({
        up : uppipe,
        down : downpipe,
        height : upHeight
    })
}
Bird.prototype.createPipe = function(eleName,classNameList,styleList){
    var $pipe = $(`<${eleName}></${eleName}>`);
    $pipe.css(styleList);
    classNameList.forEach((item) =>{
        $pipe.addClass(item);
    })
    return $pipe;
}
var bird = new Bird();
bird.init();