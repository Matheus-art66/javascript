const { select, input, checkbox } = require('@inquirer/prompts')
const fs = require("fs").promises

let mensagem = "" 
let meta = {
    value: "Tomar 3l de agua",
    checked: false,
}
let metas
const carregarmetas = async () =>{
    try {
        const dados = await fs.readFile("metas.json", "utf-8")
        metas = JSON.parse(dados)
    }
    catch(erro) {
        metas = []
    }
}
const salvarmetas = async()=>{
    await fs.writeFile("metas.json", JSON.stringify(metas, null, 2))
}
const cadastrarmetas = async() => {
    const meta = await input({message:"Digite a meta:"})
    
    if(meta.length == 0){
        mensagem = 'A meta não pode ser vazia.'
        return
    }
    metas.push({
        value: meta, checked:false
    })
}
const listarmetas = async()=>{
    if (metas.length == 0){
        mensagem = "Não possui metas"
        return
    }
    const respostas = await checkbox({
        message: "Use as setas para mudar de meta,o espaço para marca ou desmarca e o Enter para finalizar",
        choices:[...metas],
        instructions: false
    }) 

    metas.forEach((m)=>{
        m.checked = false
    })

    if (respostas.length == 0){
       mensagem = "Nenhuma meta selecionada."
    }

    respostas.forEach((respostas)=>{
        const meta = metas.find((m)=>{
            return m.value == respostas
        })
        meta.checked = true
    }) 
}
const metasrealizadas=async()=>{
    if (metas.length == 0){
        mensagem = "Não possui metas"
        return
    }
    const realizadas = metas.filter((meta)=>{
        return meta.checked
    })
    if(realizadas.length == 0){
        mensagem = 'Não existe nenhuma meta realizada! :('
        return
    }
    await select({
        message:"Metas realizadas: " + realizadas.length,
        choices:[...realizadas]
    })
}
const metasabertas = async()=>{
    if (metas.length == 0){
        mensagem = "Não possui metas"
        return
    }
    const abertas = metas.filter((meta)=>{
        return meta.checked != true
    })
    if(abertas.length == 0){
        mensagem = "Não existe metas abertas :)"
        return
    }
    await select({
        message:"Metas abertas: " + abertas.length,
        choices:[...abertas]
    })
}
const deletarmetas = async()=>{
    if (metas.length == 0){
        mensagem = "Não possui metas"
        return
    }
    const metasdersmarcadas = metas.map((meta)=>{
        return {value: meta.value, checked: false}
    })
    const itensadeletar = await checkbox({
        message: "Use as setas para mudar de meta,o espaço para marca ou desmarca e o Enter para finalizar",
        choices:[...metasdersmarcadas],
        instructions: false
    })
    
    if(itensadeletar.length == 0){
        mensagem = "Nenhum item selecionado!"
        return
    }

    itensadeletar.forEach((item)=>{
        metas = metas.filter((meta)=>{
            return meta.value != item
        })
    })
    mensagem = "Metas deletadas com sucesso!"
}
const lermensagem = ()=>{
    console.clear()
    if(mensagem != ""){
        console.log(mensagem)
        console.log("")
        mensagem = ""
    }
}
const start = async () => {
    await carregarmetas()

    while(true){
        lermensagem()
        await salvarmetas()
        const opcao = await select({
            name: "Menu >",
            choices: [{
                name: "Cadastrar metas",
                value:"cadastrar"
            },{
                name:"Listar metas",
                value:"listar"
            },{
                name:"Listar abertas",
                value:"abertas"
            },{
                name:"Metas Realizadas",
                value:"realizadas"
            },{
                name:"Deletar metas",
                value:"deletar"
            },{
                name:"Sair",
                value:"sair"
            }]
        })

        switch(opcao){
            case "cadastrar":
                await cadastrarmetas()
                break
            case "listar":
                await listarmetas()
                break
            case "realizadas":
                await metasrealizadas()
                break
            case "abertas":
                await metasabertas()
                break
            case "deletar":
                await deletarmetas()
                break  
            case "sair":
                console.log("Até a proxima!")
                return

        }
    }
} 
start()