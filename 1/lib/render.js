function Render(url, main_selector) {
  //判断参数是否为空
  if (!url || !main_selector) return;
  this.url = url;
  this.main_ele = $(main_selector);
  this.init();
}
Render.prototype = {
  constructor: Render,
  init() {
    this.load_data()
      .then(function (res) {
        console.log(res)
        this.json = res.data.list;
        this.render_page();
        this.sort();
      }.bind(this))
  },
  //函数功能为通过ajax发送请求，实现jsonp跨域访问接口中的数据
  load_data() {
    this.opt = {
      url: this.url,
      dataType: "jsonp",
      statusCode: {
        404: function () {
          alert('page not found');
        },
      }
    };
    return $.ajax(this.opt)
  },
  //接收到返回来的数据渲染到页面中
  render_page() {
    this.html = ``;
    this.json.forEach(function (item) {
      this.html += `<li>
                              <img src=${item.image}>
                              <span>${item.title}</span>
                              <button data-id="${item.item_id}">加入购物车</button>
                          </li>`
    }.bind(this))
    this.main_ele.html(this.main_ele.html() + this.html);
  },
  //页面标题长短不一，实现无缝拼接
  sort() {
    this.children = this.main_ele.find("li");
    var heightArray = [];
    for (var i = 0; i < this.children.length; i++) {
      if (i < 5) {
        heightArray.push($(this.children[i]).height()); //将每一行的五个li的高度存进数组
      } else {
        var minHeight = Math.min.apply(false, heightArray);  //调用Math函数求出最小高度
        var minIndex = heightArray.indexOf(minHeight);  //获得最小高度li的下标
        this.children.eq(i).css({       //将后面的li拼接进去
          position: "absolute",
          left: this.children.eq(minIndex).position().left + 5,  //从最小高度li开始放
          top: minHeight += 10       //间隔为10
        })
        heightArray[minIndex] = minHeight + this.children.eq(i).height(); //重置高度，之后重新计算最小高度
      }
    }
  },
}
new Render("http://mce.meilishuo.com/jsonp/get/3?offset=0&frame=1&trace=0&limit=10&endId=0&pid=106888&_=1526528205879", "#wrap")