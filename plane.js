/**
 * Created by Tony Wang as Codes Examples.
 */


function dlImg(img) { // 返回一个img对象
    var oimg = new Image();
    oimg.src = 'images/' + img;
    return oimg;
}

function run(c) {
    var ctx = c.getContext('2d'),
        score = document.getElementById('score');
    var w = parseInt(c.getAttribute('width')),
        h = parseInt(c.getAttribute('height'));
    function Enemy(type) { // 飞机对象
        this.type = type; // 飞机类型
        this.img = oimgarr['plane' + this.type + '.png'];
        this.x = parseInt(Math.random() * (w - this.img.width));
        this.y = 0;
        this.speed = parseInt(Math.random() * 2) + 1; // 速度
        this.life = this.type == 1 ? 1 : this.type == 2 ? 5 : 15; // 生命力
        this.states = this.type == 1 ? 3 : this.type == 2 ? 4 : 6;
        this.curstate = 1;
        this.diedefer = 200;
        this.score = this.type == 1 ? 1000 : this.type == 2 ? 3000 : 8000; // 分数
        this.shooting = function () {
            this.life --;
        };
        this.isDie = function () {
            return this.life == 0;
        };
    }
    function  Cartridge() { // 子弹
        this.img = oimgarr['cartridge.png'];
        this.x = me.x + me.img.width / 2;
        this.y = me.y - 20;
    }
    var bg = { // 背景
        img: oimgarr['bg.jpg'],
        y: 0,
        scrolling: function () {
            ctx.drawImage(this.img, 0, this.y, this.img.width, this.img.height);
            ctx.drawImage(this.img, 0, this.y - this.img.height +10, this.img.width, this.img.height);
            this.y >= h ? this.y = this.y - this.img.height +10 : this.y ++;
        }
    };
    var me = { // 我方战机
        img: oimgarr['me.png'],
        x: 0,
        y: 0,
        cartridges: [],
        defer: 0,
        status: true, // 生命特征
        diedefer: 30,
        curstate: 1,
        states: 4,
        score: 0, // 得分
        init: function () {
            this.x = parseInt(w / 2) - this.img.width / 2;
            this.y = parseInt(h - this.img.height);
        },
        setSite: function (x, y) { // 更新我方战机的位置
            if(this.status) {
                this.x = x - this.img.width / 2;
                this.y = y - this.img.height / 2;
            }
        },
        moving: function () { // 移动我方战机
            ctx.drawImage(this.img, this.x, this.y, this.img.width, this.img.height);
        },
        shoot: function () {
            if(this.status) {
                this.cartridges.map(function (c, i) {
                    if (c.y > 0) {
                        ctx.drawImage(c.img, c.x, c.y, c.img.width, c.img.height);
                        c.y = c.y - 4;
                    }
                    else {
                        me.cartridges.splice(i, 1); // 删除超过顶部位置的子弹
                    }
                });
                if (this.defer == 15) {
                    this.cartridges.push(new Cartridge());
                    this.defer = 0;
                }
                this.defer++;
            }
        },
        crash: function (e) {
            var e0 = [e.x, e.y, e.x + e.img.width, e.y + e.img.height],
                me0 = [me.x + me.img.width / 4, me.y + me.img.height / 4, me.x + me.img.width * 3 / 4, me.y + me.img.height * 3 / 4],
                siteTest = function (x,y) {
                    return x >= e0[0] && y >= e0[1] && x <= e0[2] && y <= e0[3];
                };
            if(siteTest(me0[0], me0[1]) || siteTest(me0[0], me0[3]) || siteTest(me0[2], me0[1]) || siteTest(me0[2], me0[3])){
                me.status = false;
            }
        },
        gameOver: function () {
            if(!me.status) {
                if (me.diedefer == 30) {
                    if (me.curstate <= me.states) {
                        me.img = oimgarr['me_die' + me.curstate + '.png'];
                        me.curstate ++;
                        me.diedefer = 0;
                    }
                    else {
                        clearInterval(time);
                        var sendscore = window.parent.document.getElementById("planscore");
                        sendscore.innerText = me.score;
                        var scc = window.parent.document.getElementById("uscore");
                        scc.value = me.score;
                        sendscore.setAttribute("style", "display:block");
                        window.parent.document.getElementById("enddiv").setAttribute("style", "display:block");
                        window.parent.document.getElementById("maindiv").setAttribute("style", "display:block");
                        window.parent.document.getElementById("gan").setAttribute("style", "display:none");
                        //alert(me.score);
                    }
                }
                me.diedefer ++;
            }
        }
    };
    me.init();
    var enemy = {
        enemys: [],
        defer: 0,
        count: 0,
        addEnemy: function (){
            if (this.defer == 50) {
                if(this.count < 20)
                    this.count ++;
                else
                    this.count = 0;
                if(this.count == 20) {
                    this.enemys.push(new Enemy(3));
                }
                else if(this.count % 6 == 0){
                    this.enemys.push(new Enemy(2))
                }
                else{
                    this.enemys.push(new Enemy(1))
                }
                this.defer = 0;
            }
            this.defer ++;
        },
        movingEnemy: function () {
            this.enemys.map(function (e, i) {
                if (e.y > h) {
                    enemy.enemys.splice(i, 1);
                }
                else {
                    ctx.drawImage(e.img, e.x, e.y, e.img.width, e.img.height);
                    !e.isDie() ? e.y = e.y + e.speed : '';
                }
            });
        },
        isShoot: function () {
            this.enemys.map(function (e,i) {
                var rx = e.x + e.img.width,
                    by = e.y + e.img.height;
                me.cartridges.map(function (c,j) {
                    if(!e.isDie() && (c.x > e.x && c.x < rx) && (c.y > e.y && c.y < by)){
                        e.shooting();
                        me.cartridges.splice(j,1); // 击中敌机后清除该子弹
                    }
                    if(e.isDie()){
                        if(e.curstate == 1){ // 计算得分并显示
                            me.score = me.score + e.score;
                            yyy.innerText = String(me.score);
                        }
                        if (e.diedefer == 200) {
                            if(e.curstate <= e.states) {
                                e.img = oimgarr['plane' + e.type + '_die' + e.curstate + '.png'];
                                e.curstate ++;
                                e.diedefer = 0;
                            }
                            else{
                                enemy.enemys.splice(i, 1);
                            }
                        }
                        e.diedefer ++;
                    }
                });
                me.crash(e);
            });
        }
    };
    var time = setInterval(function () {
        bg.scrolling();
        me.moving();
        me.shoot();
        enemy.addEnemy();
        enemy.movingEnemy();
        enemy.isShoot();
        me.gameOver();
    }, 10);
    c.addEventListener('mousemove', function (e) {
        var x = e.pageX - c.offsetLeft,
            y = e.pageY;
        if(x >= me.img.width / 2 && x <= w - me.img.width / 2){
            if(y >= h - me.img.height / 2)
                me.setSite(x, h - me.img.height / 2);
            else if(y <= me.img.height / 2)
                me.setSite(x, me.img.height / 2);
            else
                me.setSite(x, y);
        }
        else if(y <= h - me.img.height / 2 && y >= me.img.height / 2) {
            if(x >= w - me.img.width / 2)
                me.setSite(w - me.img.width / 2, y);
            else if(x <= me.img.width / 2)
                me.setSite(me.img.width / 2, y);
            else
                me.setSite(x, y);
        }
    }, false);
    c.addEventListener('touchmove');
}

function loadAllImg(img, fun) {
    var l = img.length,
        i,h = 0;
    for(i = 0; i < l; i ++){
        oimgarr[img[i]] = dlImg(img[i]);
        oimgarr[img[i]].onload = function () {
            this.width = this.width  * sw;
            this.height = this.height  * sw;
            h ++;
            h >= l && fun();
        }
    }
}

var oimgarr = {}; // 保存所有图片的img对象
var c = document.getElementById('c-plane');

(function () { // 适应手机屏幕
    c.setAttribute('height', 800 > window.innerHeight ? window.innerHeight.toString() : '800');
    c.setAttribute('width', 480 > window.innerWidth ? window.innerWidth.toString() : '480');
})();

var sw = parseInt(c.getAttribute('width')) / 480;

loadAllImg(['bg.jpg','cartridge.png','me.png','me_die1.png','me_die2.png','me_die3.png','me_die4.png',
    'plane1.png','plane1_die1.png','plane1_die2.png','plane1_die3.png',
    'plane2.png','plane2_die1.png','plane2_die2.png','plane2_die3.png','plane2_die4.png',
    'plane3.png','plane3_die1.png','plane3_die2.png','plane3_die3.png','plane3_die4.png','plane3_die5.png','plane3_die6.png'],
    function () {
        run(c);
    }
);