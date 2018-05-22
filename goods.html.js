"use strict"
//合约地址
var dappAddress = "n22E6rwJnBBKj6odaTmUWDTv4jbtUScNvJX";

//here we use neb.js to call the "get" function to search from the Dictionary
var nebulas = require("nebulas"),
    Account = nebulas.Account,
    neb = new nebulas.Neb();
//合约所在的链，这里指的是testnet
neb.setRequest(new nebulas.HttpRequest("https://testnet.nebulas.io"));
var NebPay = require("nebpay");     //https://github.com/nebulasio/nebPay
var nebPay = new NebPay();

var default_nonce = "0"
var default_gas_price = "1000000"
var default_gas_limit = "2000000"

$('#goods_add').click(function(){
    var to = dappAddress
    var value = "0.01";
    var callFunction = "add";
    if (!_arg_valid($("#goods_name").val())) return
    var callArgs = "[\"" + $("#goods_name").val() + "\"]"; //in the form of ["args"]
    var options = ""
    //这个API表示需要手续费的，一般用于增删改
    var num = nebPay.call(to, value, callFunction, callArgs, options)
})

$('#goods_buy').click(function(){
    var to = dappAddress
    var value = $("#goods_price").val()
    var callFunction = "buy";
    if (!_arg_valid($("#goods_name").val())) return
    var callArgs = "[\"" + $("#goods_name").val() + "\"]"; //in the form of ["args"]
    var options = ""
    //这个API表示需要手续费的，一般用于增删改
    var num = nebPay.call(to, value, callFunction, callArgs, options)
})

// 搜索功能: 查找Super-Dictionary 中有没有该词条
$("#goods_search").click(function(){
    // $("#search_value").val() 搜索框内的值
    var from = Account.NewAccount().getAddressString();
    var to = dappAddress
    var value = "0";
    //var nonce = "0"
    //var gas_price = "1000000"
    //var gas_limit = "2000000"
    var callFunction = "search";
    if (!_arg_valid($("#goods_name").val())) return
    var callArgs = "[\"" + $("#goods_name").val() + "\"]"; //in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    }
    //这个API不需要手续费，一般用于查询
    neb.api.call(from, dappAddress, value, default_nonce, default_gas_price, default_gas_limit, contract).then(function (resp) {
        alert(resp.result)
    }).catch(function (err) {
        alert("show " + err.message)
        console.log("error:" + err.message)
    })
})

$("#get_top10").click(function(){
    // $("#search_value").val() 搜索框内的值
    var from = Account.NewAccount().getAddressString();

    //var from = 
    //from = $("#wallet_name").val()
    var to = dappAddress
    var value = "0";
    var callFunction = "top10";
    if (!_arg_valid($("#top10_topic").val())) return
    var callArgs = "[\"" + $("#top10_topic").val() + "\"]"
    var contract = {
        "function": callFunction,
        "args": callArgs
    }
    //这个API不需要手续费，一般用于查询
    neb.api.call(from, dappAddress, value, default_nonce, default_gas_price, default_gas_limit, contract).then(function (resp) {
        alert(resp.result)
    }).catch(function (err) {
        alert("show " + err.message)
        console.log("error:" + err.message)
    })

})

var week_rank_list = []
var month_rank_list = []
var year_rank_list = []
var all_rank_list = []
var list_type = ""
var default_img_url = "https://explorer.nebulas.io/static/img/logo.png"

var ranking_list = function(callArgs) {
    var from = Account.NewAccount().getAddressString();
    var to = dappAddress
    var value = "0";
    var callFunction = "top10";
    callArgs = "[\"" + callArgs + "\"]"
    var contract = {
        "function": callFunction,
        "args": callArgs
    }
    //这个API不需要手续费，一般用于查询
    neb.api.call(from, dappAddress, value, default_nonce, default_gas_price, default_gas_limit, contract).then(function (resp) {
        cb_showRankingList(resp.result)
    }).catch(function (err) {
        alert("show err: " + err.message)
        console.log("error:" + err.message)
    })
}

$("#show_ranking li a").click(function(){
    $("#show_ranking li a").removeClass("active")
    $(this).addClass("active")
    var typ = $(this).attr("name")
    var callArgs = get_date_topic(typ)
    $("#rank_list_topic").text("Getting " + typ + " 排行榜")
    ranking_list(callArgs)
})

//show_myModal
$("#ranking_list tr td #show_myModal").click(function() {
    var myModal = $("#myModal")
    var name = "null"
    var price = "$ 0.0000 nas"
    var owner = "null"
    var url = ""
    var arr = []
    switch (list_type) {
        case "all":
            arr = all_rank_list
            break;
        case "year":
            arr = year_rank_list
            break;
        case "month":
            arr = month_rank_list
            break;
        case "week":
            arr = week_rank_list
            break;
        default:
            return
            break;
    }
    var num = $("#ranking_list tr td #show_myModal").index(this)
    if (num < arr.length) {
        $("#modal_goods_name").text(arr[num].name)
        $("#modal_goods_price").text("$ " + arr[num].price + " nas")
        $("#modal_goods_owner").text(arr[num].owner)
        var description = "has no description yet"
        if (arr[num].description != "") description = arr[num].description
        $("#modal_goods_description").text(description)
        var img = new Image()
        img.onload = function() {
            $("#modal_goods_img").attr({src: arr[num].url, title:"pic_url"})
        }
        img.onerror = function() {
            $("#modal_goods_img").attr({src: default_img_url, title:"pic_url"})
        }
        img.src = arr[num].url
    }
})

var cb_showRankingList = function(str) {
    var json = JSON.parse(str)
    json = eval('(' + json + ')')

    //deal with list
    var nameArr = $("#ranking_list").children("tr").children("#name")
    var priceArr = $("#ranking_list").children("tr").children("#price")
    var img_urlArr = $("#ranking_list").children("tr").children("td").children("#img_url")
    var arr = new Array(nameArr.length)

    $.each(json.list, function(i, obj) {
        //arr.push([obj.name, obj.price, obj.owner]);
        if (i < nameArr.length) {
            arr[i] = {
                name: obj.name,
                price: obj.price,
                owner: obj.owner,
                url: obj.url,
                description: obj.description
            };
            //name
            var name = obj.name
            if (name.length > 13) name = name.substr(0, 13) + "..."
            nameArr.eq(i).text(name)
            //price
            priceArr.eq(i).text("$" + obj.price + "nas")
            //当img_url下载失败或者解析错误的时候，使用默认图片
            var img = new Image()
            img.onload = function() {
                img_urlArr.eq(i).attr({src: obj.url, title:"pic_url"})
            }
            img.onerror = function() {
                img_urlArr.eq(i).attr({src: default_img_url, title:"pic_url"})
            }
            img.src = obj.url
        }
    })

    //todo: deal with topic
    var topicArr = json.topic.split("_")
    var topic = ""
    //if (topics.length = 1) //means all
    switch (topicArr.length) {
        case 2://means year
            topic = topicArr[1] + "年"
            list_type = "year"
            year_rank_list = arr
            break;
        case 4://means week or month
            if (topicArr[2] == "Month") {
                topic = topicArr[1] + "年" + topicArr[3] + "月"
                list_type = "month"            
                month_rank_list = arr
            }
            else if (topicArr[2] == "Week") {
                topic = topicArr[1] + "年" + topicArr[3] + "周"
                list_type = "week"
                week_rank_list = arr
            }
            else {
                alert("error occured")
            }
            break;
        case 1://means all
            if (topicArr[0] == "Top10") {
                topic = "总"
                list_type = "year"
                all_rank_list = arr
            } else {
                topic = "未更新"
            }
            
            break;
    }
    $("#rank_list_topic").text(topic + " 排行榜")
}

$("#goods_list").click(function(){
    var from = Account.NewAccount().getAddressString();

    var to = dappAddress
    var value = "0";
    var callFunction = "list";
    //var getFunction = "getAlias"
    //var getArgs = ""
    if (!_arg_valid($("#wallet_name").val())) return
    var callArgs = "[\"" + $("#wallet_name").val() + "\"]" // //in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    }
    //这个API不需要手续费，一般用于查询
    neb.api.call(from, dappAddress, value, default_nonce, default_gas_price, default_gas_limit, contract).then(function (resp) {
        alert(resp.result)
    }).catch(function (err) {
        alert("show " + err.message)
        console.log("error:" + err.message)
    })

})

//picture url
$('#goods_picUpdate').click(function(){
    var to = dappAddress
    var value = "0";
    var callFunction = "updatePicUrl";
    if (!_arg_valid($("#goods_name").val())) return
    if (!_arg_valid($("#goods_picurl").val())) return
    var callArgs = "[\"" + $("#goods_name").val() + "\",\"" + $("#goods_picurl").val() + "\"]"; //in the form of ["args"]
    var options = ""
    //这个API表示需要手续费的，一般用于增删改
    var num = nebPay.call(to, value, callFunction, callArgs, options)
})
$("#goods_picGet").click(function(){
    var from = Account.NewAccount().getAddressString();

    var to = dappAddress
    var value = "0";
    var callFunction = "getPicUrl";
    if (!_arg_valid($("#goods_name").val())) return
    var callArgs = "[\"" + $("#goods_name").val() + "\"]" // //in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    }
    //这个API不需要手续费，一般用于查询
    neb.api.call(from, dappAddress, value, default_nonce, default_gas_price, default_gas_limit, contract).then(function (resp) {
        alert(resp.result)
    }).catch(function (err) {
        alert("show " + err.message)
    })
})

//description
$('#goods_update_description').click(function(){
    var to = dappAddress
    var value = "0";
    var callFunction = "updateGoodsDescription";
    if (!_arg_valid($("#goods_name").val())) return
    if (!_arg_valid($("#goods_description").val())) return
    var callArgs = "[\"" + $("#goods_name").val() + "\",\"" + $("#goods_description").val() + "\"]"; //in the form of ["args"]
    var options = ""
    //这个API表示需要手续费的，一般用于增删改
    var num = nebPay.call(to, value, callFunction, callArgs, options)
})
$("#goods_get_description").click(function(){
    var from = Account.NewAccount().getAddressString();

    var to = dappAddress
    var value = "0";
    var callFunction = "getGoodsDescription";
    if (!_arg_valid($("#goods_name").val())) return
    var callArgs = "[\"" + $("#goods_name").val() + "\"]" // //in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    }
    //这个API不需要手续费，一般用于查询
    neb.api.call(from, dappAddress, value, default_nonce, default_gas_price, default_gas_limit, contract).then(function (resp) {
        alert(resp.result)
    }).catch(function (err) {
        alert("show " + err.message)
    })
})


/**
 * common function
 */

var _getDateWeek = function(myDate, dowOffset) {
    dowOffset = typeof(dowOffset) == 'int' ? dowOffset : 0; //default dowOffset to zero
    var newYear = new Date(myDate.getFullYear(), 0, 1);
    var day = newYear.getDay() - dowOffset; //the day of week the year begins on
    day = (day >= 0 ? day : day + 7);
    //var daynum = Math.floor((myDate.getTime() - newYear.getTime())/86400/1000) + 1;
    //var daynum = 31 + 28 + 31+ 30 + 21//myDate.getDate()
    var monDayArr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    var daynum = 0
    for (var i = 0; i < myDate.getMonth(); i++) {
        daynum += monDayArr[i]
    }
    daynum += myDate.getDate()
    if (myDate.getMonth() > 1) {
        if ((myDate.getFullYear() % 4 == 0 && myDate.getFullYear() % 100 != 0) 
        || myDate.getFullYear() % 400 == 0) {
            //leap year
            daynum += 1
        }
    }
    var weeknum;
    //if the year starts before the middle of a week
    if(day < 4) {
        weeknum = Math.floor((daynum + day - 1) / 7) + 1;
        //copy to readme
    }
    else {
        weeknum = Math.floor((daynum + day - 1) / 7);
    }
    return weeknum;
}

var get_date_topic = function(typ) {
    var d = new Date()
    var topic = "Top10"
    switch (typ) {
        case "week":
            topic = "Top10_" + d.getFullYear() + "_Week_" + _getDateWeek(d, 0)
            break;
        case "month":
            topic ="Top10_" + d.getFullYear() + "_Month_" + (d.getMonth() + 1)
            break;
        case "year":
            topic ="Top10_" + d.getFullYear()
            break;
        case "all":
            topic ="Top10"
            break;
        default:
            alert("call arg should be one of [week, month, year, all]")
            break;
    }
    return topic
}

var _arg_valid = function(arg) {
    if (arg.indexOf('\"') != -1)  {
        alert("arg can not has \" ")
        return false
    }
    return true
}

window.onload = ranking_list(get_date_topic("week"))