window.addEventListener('DOMContentLoaded', () => {
    var fileName = "Untitled"

    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const dependency of ['chrome', 'node', 'electron']) {
      replaceText(`${dependency}-version`, process.versions[dependency])
    }

    replaceText(`file-name`, fileName)

})