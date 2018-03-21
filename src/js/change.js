/**
 * Created by holmes on 2016/12/2.
 */
$(function () {
    // 加载轮播图
    var swiperHtml = '<div class="swiper-wrapper">'+
        '<div class="swiper-slide"><a href=""><img src="../img/banner.png" alt=""></a></div>'+
        '<div class="swiper-slide"><a href=""><img src="../img/banner2.png" alt=""></a></div>'+
        '<div class="swiper-slide"><a href=""><img src="../img/banner.png" alt=""></a></div>'+
        '<div class="swiper-slide"><a href=""><img src="../img/banner2.png" alt=""></a></div>'+
        '</div>'+
        '<div class="swiper-pagination"></div>';
    $('.swiper-container').append(swiperHtml);

    // 配置轮播图
    var swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
//        nextButton: '.swiper-button-next',
//        prevButton: '.swiper-button-prev',
        paginationClickable: true,
        spaceBetween: 30,
        centeredSlides: true,
        autoplay: 2500,
        autoplayDisableOnInteraction: false
    });


// 加载产品标题简介
    var briefHtml = '<div class="brief_title">[品牌名称] 商品主要名称信息 最多会有两行的长度但是又可能只有一行的长度</div>'+
        '<div class="brief_price">'+
            '<p><span class="price_one">特卖价</span><span class="span_m">&yen;999.0</span><s class="price_two">29999.9</s><br>'+
                '<span class="price_three">分红：<span class="bonus">29</span></span>'+
            '</p>'+
        '</div>';
    $('.goods_brief').html(briefHtml);

// 加载产品规格
    var spec_itemHtml = '<span class="spec_list none">暖梦四孔被（粉色)</span>'+
            '<span class="spec_list">暖梦四（粉色)</span>'+
            '<span class="spec_list">暖梦（粉色)</span>'+
            '<span class="spec_list active">暖（粉色)</span>';
    $('.spec_item').html(spec_itemHtml);

    // 加载商品介绍文字介绍
    var text_goodsHtml = '商品介绍文字和图片，商品介绍文字和图片，商品介绍文字和图片商品介绍文字和图片商品介绍文字和图片商品介绍文字和图片商品介绍文字和图片商品介绍文字和图片商品介绍文字和图片商品介绍文字和图片商品介绍文字和图片商品介绍文字和图片商品介绍文字和图片商品介绍文字和图片商品介绍文字和图片商品介绍文字和图片商品介绍文字和图片商品介绍文字和图片商品介绍文字和图片商品介绍文字和图片。'
    $('.text_goods').html(text_goodsHtml);

    // 加载商品介绍图片介绍
    var pic_goodsHtml = '<img src="../img/banner.png" alt=""/>'+
        '<img src="../img/banner2.png" alt=""/>'+
        '<img src="../img/banner.png" alt=""/>';
    $('.pic_goods').html(pic_goodsHtml);

// 加载参数规格
    var parameterHtml = '<tr>'+
            '<td>介绍文字图片商品</td>'+
            '<td>介绍文字和图片商品介绍文字和图片商</td>'+
        '</tr>'+
        '<tr>'+
            '<td>介绍片商品</td>'+
            '<td>介绍文字和图片商</td>'+
        '</tr>'+
        '<tr>'+
            '<td>介绍文字图片商品</td>'+
            '<td>介绍文字和图片商品介绍文字和图片商</td>'+
        '</tr>'+
        '<tr>'+
            '<td>介绍文字图片商品</td>'+
            '<td>介绍文字和图片商品介绍文字和图片商</td>'+
        '</tr>';
    $('.parameter').html(parameterHtml);

    // 加载购买须知
    var to_knowHtml = '<div class="know_box know_one">'+
            '<h5>购买须知一</h5>'+
            '<p>商品介绍文字和图片，商品介绍文字和图片，绍文字和图片商介绍文' +
            '字品介绍文字和图片商品和图片商品介绍文字和图片商品介绍文字和图片。'+
            '</p>'+
        '</div>'+
        '<div class="know_box know_two">'+
            '<h5>购买须知二</h5>'+
            '<p>商品介绍文字和图片，商品介绍文字和图片，商介绍文字和图片商品介绍文字' +
            '和字和图片商品介绍文字和图片商品介绍文字和图片商品介绍文字和图片。'+
            '</p>'+
        '</div>'+
        '<div class="know_box know_three">'+
            '<h5>购买须知三</h5>'+
            '<p>商品介绍文字和图片，商品介绍文字和图片，商品介绍文字和图片商品' +
            '介文字和图片商品介绍文字和图片商品介绍文字和图片。'+
            '</p>'+
        '</div>'+
        '<div class="know_box know_else">'+
            '<img src="../img/else@1.png" width="40%" alt=""/>'+
            '<img src="../img/else@2.png" width="50%" alt=""/>'+
            '<img src="../img/else@3.png" width="60%" alt=""/>'+
         '</div>';
    $('.to_know').html(to_knowHtml);


    // 加载文案介绍中的文字介绍
    var document_textHtml = '介绍文案介绍文案介绍文案介绍文案介绍文案介文案介绍文文案介绍文案介绍文案介绍文案介绍文案介绍文案介绍文案介绍文案。';
    $('.document_text').html(document_textHtml);

    // 选择规格标签
    $('.spec_list').on('tap',function () {
        $(this).addClass('active')
            .siblings().removeClass('active');
    });

});