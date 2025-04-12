export const flexible = () => {
  if (typeof window !== 'undefined') {
    let width = window.screen.width;
  
    if (width > 414) {
      document.documentElement.style.fontSize = 110 + 'px'
    } else {
      document.documentElement.style.fontSize = (width / 375) * 100 + 'px'
    }
    window.onload = function () {
      let width = window.screen.width;
      if (width > 414) {
        document.documentElement.style.fontSize = 110 + 'px'
      } else {
        document.documentElement.style.fontSize = (width / 375) * 100 + 'px'
      }
    }
    //当浏览器窗口大小改变时，设置显示内容的高度
    window.onresize = function () {
      let width = window.screen.width;
      if (width > 414) {
        document.documentElement.style.fontSize = 110 + 'px'
      } else {
        document.documentElement.style.fontSize = (width / 375) * 100 + 'px'
      }
    }
  }
}







