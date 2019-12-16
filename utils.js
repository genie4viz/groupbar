function getUrlParam(parameter, defaultvalue) {
    let urlparameter = defaultvalue;
    if (window.location.href.indexOf(parameter) > -1) {
        urlparameter = getUrlVars()[parameter];
    }
    return urlparameter;
}

function getUrlVars() {
    let vars = {};
    let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

function Formatter(num) {
    let strNum = '';
    if (num > 1E8) {
        strNum = nFormatter(num, 0);
    } else if (num > 1E6) {
        strNum = nFormatter(num, 1);
    } else if (num > 1E5) {
        strNum = nFormatter(num, 0);
    } else if (num > 1E4) {
        strNum = nFormatter(num, 1);
    } else if (num > 1E3) {
        strNum = nFormatter(num, 1);
    } else {
        strNum = num;
    }
    return strNum
}

function nFormatter(num, digits) {
    var si = [
        {value: 1, symbol: ""},
        {value: 1E3, symbol: "k"},
        {value: 1E6, symbol: "M"},
        {value: 1E9, symbol: "G"},
        {value: 1E12, symbol: "T"},
        {value: 1E15, symbol: "P"},
        {value: 1E18, symbol: "E"}
    ];
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

function sorted(arr, kind) {
    let columns = arr.columns;
    const nested = d3.nest()
        .key(d => d[columns[dim1]])
        .entries(arr);
    let re_arr = [];
    // console.log(nested, 'nested')
    // if(kind === 'htol' || kind === 'ltoh') {
    //     nested.forEach(n => {
    //         n.values.sort((a, b) => kind === 'htol' ? b[columns[m]] - a[columns[m]] : a[columns[m]] - b[columns[m]]);
    //         n.values.forEach(nv => {
    //             re_arr.push(nv);
    //         })                
    //     })            
    // }
    if(kind === 'atoz' || kind === 'ztoa'){            
        nested.forEach(n => {
            
            n.values.sort((a, b) => {
                if(kind === 'atoz') {
                    if(a[columns[dim2]] < b[columns[dim2]]) { return -1; }
                    if(a[columns[dim2]] > b[columns[dim2]]) { return 1; }                        
                }else {
                    if(a[columns[dim2]] < b[columns[dim2]]) { return 1; }
                    if(a[columns[dim2]] > b[columns[dim2]]) { return -1; }                        
                }                    
            });
                
            n.values.forEach(nv => {
                re_arr.push(nv);
            })                
        })
        
    }

    console.log(d3.map(re_arr, d => d[columns[dim2]]).keys(), 'nnnn')
    return {
        subgroups: d3.map(re_arr, d => d[columns[dim2]]).keys(),
        data: re_arr
    }
}
function trunc(str, length){
    let dots = str.length > length ? '...' : '';
    return str.substring(0, length) + dots;
};

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")) || 0,
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}