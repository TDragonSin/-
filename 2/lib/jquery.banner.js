//分号是为了防止别人不加分号
//加号是为了节省性能
;+function ($) {
  //将函数绑定在jquery对象上
  $.extend({
    //传入对象参数
    banner:function(options){
      new Banner(options);
    }
  });
  function Banner(options) {
    this.init(options);
  }
  Banner.prototype = {
    constructor: Banner,
    init: function (options) {
      this.index = 0;
      //轮播图主体
      this.bannerWrapper = $(".banner-wrapper");
      //判断动画效果是否为空，这是一个必填参数，默认为fade
      this.direction = options.animate ? options.animate : "fade";
      this.bannerItem = this.bannerWrapper.children();
      //是否自动播放
      if (options.autoPlay) {
        this.autoPlay();
      }
      this.bannerNum = this.bannerItem.length;
      //判断可选按钮是否存在，存在则创建
      if (!!options.nextBtn && !!options.prevBtn) {
        var btnPrev = $("<div></div>");
        var btnNext = $("<div></div>");
        btnPrev.attr("id","prev");
        btnNext.attr("id","next");
        $(".container").append(btnPrev);
        $(".container").append(btnNext);
        this.btnPrev = btnPrev;
        //绑定按钮事件
        this.btnNext = btnNext;
          this.btnPrev
          //{turn:"prev"}  当一个事件被触发时要传递event.data给事件处理函数
          //这里的event.data用来控制轮播的方向
          .on("click.changeIndex",{turn:"prev"},$.proxy(this.change_index,this))
          //绑定动画函数，按照this.direction的值来确定特效
          .on("click.animation",$.proxy(this.animation,this))
          this.btnNext
          .on("click", { turn: "next" }, $.proxy(this.change_index, this))
          .on("click", $.proxy(this.animation, this))
      }
    },
    //函数功能为改变下标
    change_index: function (event) {
      // 如果正在运动则不改变下标
      if(this.animation.moving){
        return;
      }
      var turnList = {
        //向左this.index--
        "prev": function () {
          this.prev = this.index;
          if (this.index == 0) {
            this.index = this.bannerNum - 1;
          } else {
            this.index--;
          }
        }.bind(this),
        //向左this.index++
        "next": function () {
          this.prev = this.index;
          if (this.index == this.bannerNum - 1) {
            this.index = 0;
          } else {
            this.index++;
          }
        }.bind(this),
      }
      if (!(typeof turnList[event.data.turn] == "function")) return 0;
      turnList[event.data.turn]();
    },
    //函数功能为实现动画效果
    animation: function (event) {
      //定义一个bool值来存储当前运动状态，如果正在运动则不执行函数，实现只响应第一次点击
      if(this.animation.moving){
        return;
      }
      if (this.prev == this.index) return;
      var animationList = {
        //滑落
        "slide": function () {
          animationList.slideFadeInit();
          this.bannerItem.eq(this.index)
            //将即将出现的图片zIndex值设为2，这样层级关系才正确
            .addClass("active")
            //将即将出现的图片的display设为none，因为slideDown动画只有在none状态下才生效
            .css({
              display: "none"
            })
            //执行动画，执行完毕将this.animation.moving的值设置为false，表示执行完毕
            .slideDown(function(){this.animation.moving = false}.bind(this))
            .siblings()
            .removeClass("active");
        }.bind(this),
        //淡入淡出
        "fade": function () {
          animationList.slideFadeInit();
          this.bannerItem.eq(this.index)
            .addClass("active")
            .css({
              display: "none"
            })
            .fadeIn(function(){this.animation.moving = false}.bind(this))
            .siblings()
            .removeClass("active");
        }.bind(this),
        //滚动
        "scroll": function () {
          this.bannerItem
            .css({
              zIndex: 0
            })
            //将两张图的z-index设置为2，显示出来
            .eq(this.prev)
            .css({
              zIndex: 2
            })
            .end()
            .eq(this.index)
            .css({
              zIndex: 2
            })
          //this.prev > this.index即点击的是向左的按钮
          if (this.prev > this.index) {
            //特例，无缝轮播，从第一张变到最后一张
            if(this.index == 0 && this.prev == this.bannerNum-1){
              this.bannerItem.eq(this.prev)
                .stop().animate({
                  left: -this.bannerItem.outerWidth()
                },function(){this.animation.moving = false}.bind(this))
                .end()
                .eq(this.index)
                .css({
                  left: this.bannerItem.outerWidth()
                })
                .stop().animate({
                  left: 0
                },function(){this.animation.moving = false}.bind(this))
            }else{
              this.bannerItem.eq(this.prev)
              .stop().animate({
                left: this.bannerItem.outerWidth()
              },function(){this.animation.moving = false}.bind(this))
              .end()
              .eq(this.index)
              .css({
                left: -this.bannerItem.outerWidth()
              })
              .stop().animate({
                left: 0
              },function(){this.animation.moving = false}.bind(this))
            }
            
          } else { //this.prev > this.index即点击的是向右的按钮
             //特例，无缝轮播，从最后一张变到第一张
            if(this.index == this.bannerNum-1 && this.prev == 0){
              this.bannerItem.eq(this.prev)
              .stop().animate({
                left: this.bannerItem.outerWidth()
              },function(){this.animation.moving = false}.bind(this))
              .end()
              .eq(this.index)
              .css({
                left: -this.bannerItem.outerWidth()
              })
              .stop().animate({
                left: 0
              },function(){this.animation.moving = false}.bind(this))
            }else{
              this.bannerItem.eq(this.prev)
              .stop().animate({
                left: -this.bannerItem.outerWidth()
              },function(){this.animation.moving = false}.bind(this))
              .end()
              .eq(this.index)
              .css({
                left: this.bannerItem.outerWidth()
              })
              .stop().animate({
                left: 0
              },function(){this.animation.moving = false}.bind(this))
            }              
          }
        }.bind(this),
        //动画初始化，将即将消失的图片zIndex值设为1，其余的兄弟设为空
        //这样只有当前需要改变的两张图片显示
        "slideFadeInit": function () {
          this.bannerItem.eq(this.prev)
            .css({
              zIndex: 1
            })
            .siblings()
            .css({
              zIndex: ""
            })
        }.bind(this)
      }
      this.animation.moving = true;
      animationList[this.direction]();
    },
    //函数功能为自动播放
    autoPlay:function(){
      this.bannerWrapper.on("mouseenter",function(){
        clearInterval(this.playTimer)
      }.bind(this))
      this.bannerWrapper.on("mouseleave",function(){
        clearInterval(this.playTimer);
        this.playTimer = setInterval(function(){
          this.prev = this.index;
          //改变下标
          if (this.index == this.bannerNum - 1) {
            this.index = 0;
          }else{
            this.index ++;
          }
          this.animation();
        }.bind(this),2000)
      }.bind(this))
      this.bannerWrapper.trigger("mouseleave")
    }
  }
}(jQuery);




