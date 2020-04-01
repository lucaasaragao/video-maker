const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

async function robot(content) {
  await fetchContentFromWikipedia(content) //Baixar conteudo do Wiki
  sanitizeContent(content) //Limpar o conteudo
  breakContentIntoSentences(content) //Quebrar em sentenças

  async function fetchContentFromWikipedia(content) {
     const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
     const wikipediaAlgorithm = algorithmiaAuthenticated.algo("web/WikipediaParser/0.1.2?timeout=300")
     const wikipediaResponde = await wikipediaAlgorithm.pipe(content.searchTerm)
     const wikipediaContent = wikipediaResponde.get()

     content.sourceContentOriginal = wikipediaContent.content
  }
  function sanitizeContent(content) {
    const withoutBlankLinesAndMarkdown = removeBlanckLinesAndMarkdown(content.sourceContentOriginal)
    const withoutDatesInParethese = removeDatesInParethese(withoutBlankLinesAndMarkdown)

    console.log(withoutDatesInParethese)
    
    content.sourceContentSanitized = withoutDatesInParethese
    function removeBlanckLinesAndMarkdown(text) { //função para remover linhas em branco & markdown do texto recuperado do wiki
      const allLines = text.split("\n")
      const withoutBlankLinesAndMarkdown = allLines.filter((line)=>{
        if(line.trim().length === 0 || line.trim().startsWith('=')){
          return false
        }
        return true
      })
      return withoutBlankLinesAndMarkdown.join(' ')
    }
  }
  function removeDatesInParethese(text){
    return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
  }

  function breakContentIntoSentences(content) {
    content.sentences = []
    const sentences =  sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
    sentences.forEach((sentence)=>{
      content.sentences.push({
        text: sentence,
        keywords: [],
        images: []
      })
    })
  }

} 
module.exports = robot;