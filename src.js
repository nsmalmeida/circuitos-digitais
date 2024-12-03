const states = []
states.push([])
let variables = 0
const caracteres = ['A','B','C','D','E','F','G','H']
const oneVariable = ['0','1']
const twoVariables = ['00','01','11','10']

// Armazena quais eventos já foram disparados
const events = { 
    truthtable: false,
    undo: false,
    complete0: false,
    complete1: false,
    group: false,
    simplify: false
}

// Cria a tabela verdade
function createTruthTable(variaveis) {
    const tbodyVariables = document.querySelector('.truthtable-body-variables')
    const truthTable = document.querySelector('.truthtable-body')
    const tbody = truthTable.getElementsByTagName('tbody')[0]
    const linhas = 2 ** variaveis
    for(let i = 0; i <= variaveis; i++) {
        const p = document.createElement('p')
        i == variaveis ? p.innerText = 'X' : p.innerText = caracteres[i]
        tbodyVariables.appendChild(p)
    }
    for(let i = 0; i < linhas; i++){
        const newRow = tbody.insertRow()
        const rowCollumOne = i.toString(2).padStart(variaveis, '0')
        for(let j = 0; j < variaveis; j++){
            const cell = newRow.insertCell()
            cell.textContent = rowCollumOne[j]
        }
        const rowCollumTwo = newRow.insertCell()
        const input = document.createElement('input')
        // Limita quais caracteres podem ser inseridos no input
        input.addEventListener('keydown', function (event) {
            if(event.key !== '0' && event.key !== '1' && event.key != 'x' && event.key !== 'Backspace' && event.key !== 'Delete')
                event.preventDefault()
            if(this.value.length >= 1 && event.key !== 'Backspace' && event.key !== 'Delete')
                event.preventDefault()
        })
        // Adiciona o evento para atualizar a lista de valores em cada <input>
        input.addEventListener('input', () => {
            const truthValues = document.querySelectorAll('.truthtable-body input')
            saveSate(truthValues)
        })
        input.setAttribute('type', 'text')
        input.setAttribute('title', 'Apenas "1", "0" e "x" é permitido!')
        rowCollumTwo.appendChild(input)
        truthTable.appendChild(tbody)
    }
}

function removeTruthTable() {
    const tbodyVariables = document.querySelector('.truthtable-body-variables')
    const truthTable = document.querySelector('.truthtable-body')
    const tbody = truthTable.getElementsByTagName('tbody')[0]
    tbodyVariables.innerHTML = ''
    tbody.innerHTML = ''
}

const dropdowns = document.querySelectorAll('.dropdown')

dropdowns.forEach(dropdown => {
    const select = dropdown.querySelector('.select')
    const caret = dropdown.querySelector('.caret')
    const menu = dropdown.querySelector('.menu')
    const options = dropdown.querySelectorAll('.menu li')
    const selected = dropdown.querySelector('.selected')

    select.addEventListener('click', () => {
        select.classList.toggle('select-clicked')
        caret.classList.toggle('caret-rotate')
        menu.classList.toggle('menu-open')
    })
    options.forEach(option => {
        option.addEventListener('click', () => {
            if(!events.truthtable){
                const truthTableContainer = document.querySelector('.truthtable-container')
                const divVariables = document.createElement('div')
                const divBodyContainer = document.createElement('div')
                const divScrollContainer = document.createElement('div')
                const divScroll = document.createElement('div')
                const table = document.createElement('table')
                const tbody = document.createElement('tbody')
                divVariables.classList.add('truthtable-body-variables')
                divBodyContainer.classList.add('truthtable-body-container')
                divScrollContainer.classList.add('scroll-wrapper-container')
                divScroll.classList.add('scroll-wrapper')
                table.classList.add('truthtable-body')
                truthTableContainer.insertBefore(divBodyContainer, truthTableContainer.firstElementChild.nextSibling)
                divBodyContainer.appendChild(divVariables)
                divBodyContainer.appendChild(divScrollContainer)
                divScrollContainer.appendChild(divScroll)
                divScroll.appendChild(table)
                table.appendChild(tbody)
                events.truthtable = true
            }
            const tbody = document.createElement('tbody')
            removeTruthTable()
            createTruthTable(option.innerText)
            variables = option.innerText
            states.length = 0
            states.push([])
            selected.innerText = option.innerText
            select.classList.remove('select-clicked')
            caret.classList.remove('caret-rotate')
            menu.classList.remove('menu-open')
            options.forEach(option => {
                option.classList.remove('active')
            })
            option.classList.add('active')
        })
    })
})

function saveSate(truthValues) {
    const aux = []
    truthValues.forEach((values) => aux.push(values.value))
    states.push(aux)
}

// ==========================
//      Karnaugh Class
// ==========================

function karnaughmap() { // Create column end row of karnaugh map
    const kmap = []
    const rows = document.querySelectorAll('.truthtable-body tr')
    rows.forEach(e => {
        let index = 0
        const column = e.querySelectorAll('td:not(:last-child)')
        const lastCell = e.querySelectorAll('td input')
        const obj = new Object()
        column.forEach((cell, index) => {
            obj[caracteres[index]] = cell.innerText
        })
        obj['value'] = lastCell[index].value
        kmap.push(obj)
    })
    return kmap
}

class Node {
    constructor(data) {
        this.data = data
        this.check = false
        this.right = null
        this.down = null
        this.left = null
        this.up = null 
        this.group = null
        this.cindex = null
        this.rindex = null
        this.grouping = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }
    }
}
class karnaughMap {
    constructor(rows, cols) {
        this.head = null
        this.tail = null
        this.rows = rows
        this.cols = cols
        this.createMatrix()
    }
    createMatrix() {
        let previousRowStart = null
        let currentRowStart = null
        let previousNode = null
        for(let i = 0; i < this.rows; i++) {
            for(let j = 0; j < this.cols; j++) {
                const newNode = new Node(null)
                if(i === 0 && j === 0) {
                    this.head = newNode
                    currentRowStart = newNode
                }
                if(j > 0) {
                    previousNode.right = newNode
                    newNode.left = previousNode
                }
                if(i > 0) {
                    const nodeAbove = previousRowStart
                    nodeAbove.down = newNode
                    newNode.up = nodeAbove
                    previousRowStart = nodeAbove.right
                }
                newNode.cindex = j
                newNode.rindex = i
                previousNode = newNode
                if (j === 0) {
                    currentRowStart = newNode
                }
            }
            previousNode.right = currentRowStart
            currentRowStart.left = previousNode
            previousNode = null
            previousRowStart = currentRowStart
        }
        let firstNode = this.head
        for(let j = 0; j < this.cols; j++) {
            let lastNodeInColumn = firstNode
            for(let i = 0; i < this.rows - 1; i++) {
                lastNodeInColumn = lastNodeInColumn.down
            }
            lastNodeInColumn.down = firstNode
            firstNode.up = lastNodeInColumn
            firstNode = firstNode.right
        }
    }
    getNode(row, col) {
        let current = this.head;
        for (let i = 0; i < row; i++) {
            current = current.down
        }
        for (let j = 0; j < col; j++) {
            current = current.right
        }
        return current
    }
    insertValue(row, col, data) {
        let node = this.getNode(row, col)
        if(node) {
            node.data = data
        }
    }
    printMatrix() {
        let row = this.head
        for(let i = 0; i < this.rows; i++) {
            let col = row
            let rowValues = []
            for(let j = 0; j < this.cols; j++) {
                rowValues.push(col.data === null ? 'null' : col.data)
                col = col.right
            }
            row = row.down
        }
    }
    runsThrough(groupTests, groups) {
        let row = this.head
        for(let i = 0; i < this.rows; i++) {
            let col = row
            for(let j = 0; j < this.cols; j++) {
                if(col.data === 1 && col.check === false) {
                    let index = 0
                    for(const fun of groupTests){
                        const result = fun(col)
                        if(result !== null) {
                            groups[index].push(result)
                            break;
                        }
                        index++
                    }
                }
                col = col.right
            }
            row = row.down
        }
    }
}

// Cria os grupos do mapa de karnaugh e retorna o mapa agrupado
function groupsKarnaughMap() {
    const arr = []
    const tbody = document.querySelector('.karnaughmap-body')
    const rows = tbody.querySelectorAll('tr')
    rows.forEach((row, rIndex) => {
        const rmap = []
        const cells = row.querySelectorAll('td')
        cells.forEach(column => rmap.push(Number(column.innerText)))
        arr.push(rmap)
    })
    const kmap = new karnaughMap(arr.length, arr.at(0).length)
    arr.forEach((row, rindex) => {
        row.forEach((column, cindex) => {
            kmap.insertValue(rindex, cindex, column)
        })
    })
    kmap.printMatrix()
    /* 
    Each group will have a value 'group' that represents the type of group:
    isolated: 0
    adjacent: 1
    octet: 2
    quartet: 3
    duo: 4
    
    And a value 'case' - an array that stores all the shapes, first value stores test - for the group format:
    horizontal: 'h'
    vertical: 'v'
    square: 's'

    Each function returns an array -> [nodes..., 'string' -> format] containing the grouping or 'null'
    */
    const isolated = element => { // group: 0
        if(element.right.data === 0 && element.down.data === 0 && element.left.data === 0 && element.up.data === 0) {
            element.check = true
            element.grouping[0]++
            return [element, 's']
        }
        return null
    }
    const adjacet = element => { // group: 1
        const tests = e => [
            e.right.data === 1,
            e.down.data === 1,
            e.left.data === 1,
            e.up.data === 1
        ]
        const trueCounter = tests(element).filter(val => val === true).length
        if(trueCounter === 1) {
            const trueCase = tests(element).findIndex(val => val === true)
            switch(trueCase){
                case 0: // adjacent to the right
                    if(tests(element.right).filter(value => value === true).length === 1) {
                        element.check = true
                        element.grouping[1]++
                        element.right.check = true
                        element.right.grouping[1]++
                        return [element, element.right, 'h']
                    }
                    break;
                case 1: // adjacent to the down
                    if(tests(element.down).filter(value => value === true).length === 1) {
                        element.check = true
                        element.grouping[1]++
                        element.down.check = true
                        element.down.grouping[1]++
                        return [element, element.down, 'v']
                    }
                    break;
                case 2:
                    if(tests(element.left).filter(value => value === true).length === 1) {
                        element.check = true
                        element.grouping[1]++
                        element.left.check = true
                        element.left.grouping[1]++
                        return [element.left, element, 'h']
                    }
                    break;
                case 3:
                    if(tests(element.up).filter(value => value === true).length === 1) {
                        element.check = true
                        element.grouping[1]++
                        element.up.check = true
                        element.up.grouping[1]++
                        return [element.up, element, 'v']
                    }
                    break;
            }
        }
        return null

    }
    const octet = e => { // group: 2
        const tests = [
            (e.right.data === 1 && e.right !== e.left) && e.right.right.data === 1 && e.right.right.right.data === 1 && e.down.data === 1 && e.down.right.data === 1 && e.down.right.right.data === 1 && e.down.right.right.right.data === 1,
            (e.down.data === 1 && e.down !== e.up) && e.down.down.data === 1 && e.down.down.down.data === 1 && e.right.data === 1 && e.right.down.data === 1 && e.right.down.down.data === 1 && e.right.down.down.down.data === 1,
            (e.down.data === 1 && e.down !== e.up) && e.down.down.data === 1 && e.down.down.down.data === 1 && e.left.data === 1 && e.left.down.data === 1 && e.left.down.down.data === 1 && e.left.down.down.down.data === 1
        ]
        let octetGrouping = new Array()
        tests.some((test, index) => {
            if(test){
                switch(index){
                    case 0:
                        e.check = true
                        e.grouping[2]++
                        e.right.check = true
                        e.right.grouping[2]++
                        e.right.right.check = true
                        e.right.right.grouping[2]++
                        e.right.right.right.check = true
                        e.right.right.right.grouping[2]++
                        e.down.check = true
                        e.down.grouping[2]++
                        e.down.right.check = true
                        e.down.right.grouping[2]++
                        e.down.right.right.check = true
                        e.down.right.right.grouping[2]++
                        e.down.right.right.right.check = true
                        e.down.right.right.right.grouping[2]++
                        octetGrouping = [e, e.right, e.right.right, e.right.right.right, e.down, e.down.right, e.down.right.right, e.down.right.right.right, 'h']
                        break;
                    case 1:
                        e.check = true
                        e.grouping[2]++
                        e.down.check = true
                        e.down.grouping[2]++
                        e.down.down.check = true
                        e.down.down.grouping[2]++
                        e.down.down.down.check = true
                        e.down.down.down.grouping[2]++
                        e.right.check = true
                        e.right.grouping[2]++
                        e.right.down.check = true
                        e.right.down.grouping[2]++
                        e.right.down.down.check = true
                        e.right.down.down.grouping[2]++
                        e.right.down.down.down.check = true
                        e.right.down.down.down.grouping[2]++
                        octetGrouping = [e, e.down, e.down.down, e.down.down.down, e.right, e.right.down, e.right.down.down, e.right.down.down.down, 'v']
                        break;
                    case 2:
                        e.check = true
                        e.grouping[2]++
                        e.down.check = true
                        e.down.grouping[2]++
                        e.down.down.check = true
                        e.down.down.grouping[2]++
                        e.down.down.down.check = true
                        e.down.down.down.grouping[2]++
                        e.left.check = true
                        e.left.grouping[2]++
                        e.left.down.check = true
                        e.left.down.grouping[2]++
                        e.left.down.down.check = true
                        e.left.down.down.grouping[2]++
                        e.left.down.down.down.check = true
                        e.left.down.down.down.grouping[2]++
                        octetGrouping = [e.left, e.left.down, e.left.down.down, e.left.down.down.down, e, e.down, e.down.down, e.down.down.down, 'v']
                } return true
            } return false
        })
        if(octetGrouping.length === 0) return null
        else return octetGrouping
    }
    const quartet = e => { // group: 3
        const tests = [
            e.right.data === 1 && e.down.data === 1 && e.down.right.data === 1,
            e.right.data === 1 && e.up.data === 1 && e.up.right.data === 1,
            e.left.data === 1 && e.down.data === 1 && e.down.left.data === 1,
            e.left.data === 1 && e.up.data === 1 && e.up.left.data === 1,
            (e.right.data === 1 && e.right !== e.left) && e.right.right.data === 1 && e.right.right.right.data === 1,
            (e.down.data === 1 && e.down !== e.up) && e.down.down.data === 1 && e.down.down.down.data === 1,
            (e.left.data === 1 && e.left != e.right) && e.left.left.data === 1 && e.left.left.left.data === 1,
            (e.up.data === 1 && e.up !== e.down) && e.up.up.data === 1 && e.up.up.up.data === 1
        ]
        let quartetGroups = new Array()
        tests.some((test, index) => {
            if(test){
                switch(index){ // cases -> 'sq': square, 'h': horizontal and 'v': vertical
                    case 0: // square right and down
                        e.check = true
                        e.grouping[3]++
                        e.right.check = true
                        e.right.grouping[3]++
                        e.down.check = true
                        e.down.grouping[3]++
                        e.down.right.check = true
                        e.down.right.grouping[3]++
                        quartetGroups = [e, e.right, e.down, e.down.right, 's']
                        break;
                    case 1: // quartet square right and up
                        e.check = true
                        e.grouping[3]++
                        e.right.check = true
                        e.right.grouping[3]++
                        e.up.check = true
                        e.up.grouping[3]++
                        e.up.right.check = true
                        e.up.right.grouping[3]++
                        quartetGroups = [e.up, e.up.right, e, e.right, 's']
                        break;
                    case 2:
                        e.check = true
                        e.grouping[3]++
                        e.left.check = true
                        e.left.grouping[3]++
                        e.down.check = true
                        e.down.grouping[3]++
                        e.down.left.check = true
                        e.down.left.grouping[3]++
                        quartetGroups = [e.left, e, e.down.left, e.down, 's']
                        break;
                    case 3:
                        e.check = true
                        e.grouping[3]++
                        e.left.check = true
                        e.left.grouping[3]++
                        e.up.check = true
                        e.up.grouping[3]++
                        e.up.left.check = true
                        e.up.left.grouping[3]++
                        quartetGroups = [e.up.left, e.up,  e.left, e, 's']
                        break;
                    case 4: // quartet horizontal to right
                        e.check = true
                        e.grouping[3]++
                        e.right.check = true
                        e.right.grouping[3]++
                        e.right.right.check = true
                        e.right.right.grouping[3]++
                        e.right.right.right.check = true
                        e.right.right.right.grouping[3]++
                        quartetGroups = [e, e.right, e.right.right, e.right.right.right, 'h']
                        break;
                    case 5: // quartet vertical to down
                        e.check = true
                        e.grouping[3]++
                        e.down.check = true
                        e.down.grouping[3]++
                        e.down.down.check = true
                        e.down.down.grouping[3]++
                        e.down.down.down.check = true
                        e.down.down.down.grouping[3]++
                        quartetGroups = [e, e.down, e.down.down, e.down.down.down, 'v']
                        break;
                    case 6: // quartet horizontal to left
                        e.check = true
                        e.grouping[3]++
                        e.left.check = true
                        e.left.grouping[3]++
                        e.left.left.check = true
                        e.left.left.grouping[3]++
                        e.left.left.left.check = true
                        e.left.left.left.grouping[3]++
                        quartetGroups = [e.left.left.left, e.left.left, e.left, e, 'h']
                        break;
                    case 7:
                        e.check = true
                        e.grouping[3]++
                        e.up.check = true
                        e.up.grouping[3]++
                        e.up.up.check = true
                        e.up.up.grouping[3]++
                        e.up.up.up.check = true
                        e.up.up.up.grouping[3]++
                        quartetGroups = [e.up.up.up, e.up.up, e.up, e, 'v']
                        break;
                }
                return true
            }
            return false
        })
        if(quartetGroups.length === 0) return null
        else return quartetGroups
    }
    const duos = e => { // group: 4
        const tests = [
            e.right.data === 1,
            e.down.data === 1,
            e.left.data === 1,
            e.up.data === 1
        ]
        let duosGroup = new Array()
        tests.some((test, index) => {
            if(test) {
                switch(index) { // cases -> 'h': horizontal and 'v' vertical
                    case 0:
                        e.check = true
                        e.grouping[4]++
                        e.right.check = true
                        e.right.grouping[4]++
                        duosGroup = [e, e.right, 'h']
                        break;
                    case 1:
                        e.check = true
                        e.grouping[4]++
                        e.down.check = true
                        e.down.grouping[4]++
                        duosGroup = [e, e.down, 'v']
                        break;
                    case 2:
                        e.check = true
                        e.grouping[4]++
                        e.left.check = true
                        e.left.grouping[4]++
                        duosGroup = [e.left, e, 'h']
                        break;
                    case 3:
                        e.check = true
                        e.grouping[4]++
                        e.up.check = true
                        e.up.grouping[4]++
                        duosGroup = [e.up, e, 'v']
                        break;
                }
                return true
            }
            return false
        })
        if(duosGroup.length === 0) return null
        else return duosGroup
    }
    const groupTests = [isolated, adjacet, octet, quartet, duos]
    const groups = [[],[],[],[],[]]
    kmap.runsThrough(groupTests, groups) // Encontra os agrupamentos no mapa
    groups.forEach((group, gindex) => { // Esse laço verifica grupos criados descenecessariamente
        if(gindex >= 2){ // Grupos isolados e adjacente nao precisam ser verificados
            const filteredGroup = group.filter((grouping, index) => {
                let test = true
                grouping.forEach(node => { // Verifica se um nó participa de mais de 1 grupo.
                    if(typeof(node) !== 'string'){ 
                        let aux = 0
                        for(let j in node.grouping)
                            aux += node.grouping[j]
                        if(aux < 2) 
                            test = false
                    }
                })
                if(test === true) {// Todos os nós do agrupamento participam de mais de um grupo.
                    grouping.forEach(node => typeof(node) !== 'string' ? node.grouping[gindex]-- : null)
                    return false
                }
                return true
            })
            groups[gindex] = filteredGroup
        }
    })
    return groups
}

// Verifica o tipo do grupo de acordo com o indice: 0 = isolado, 1 = adjcente, ... e retorna um array: [tamanho do grupo, descrição]
function groupSize(index) {
    switch(index){
        case 0:
            return [1, 'isolated']
        case 1:
            return [2, 'adjacent']
        case 2:
            return [8, 'octet']
        case 3:
            return [4, 'quartet']
        case 4:
            return [2, 'duo']
    }
    return null
}

const buttonUndo = document.querySelector('[undo]')
buttonUndo.addEventListener('click', () => {
    const truthValues = document.querySelectorAll('.truthtable-body input')
    if(states.at(-1).length != 0){
        truthValues.forEach((e, index) => {
            e.value = states.at(-2)[index] || ''
        })
        states.pop()
    }
})

const buttonComplete0 = document.querySelector('[complete0]')
buttonComplete0.addEventListener('click', () => {
    const truthValues = document.querySelectorAll('.truthtable-body input')
    saveSate(truthValues)
    truthValues.forEach(e => {
        e.value = e.value || 0
    })
})

const buttonComplete1 = document.querySelector('[complete1]')
buttonComplete1.addEventListener('click', () => {
    const truthValues = document.querySelectorAll('.truthtable-body input')
    saveSate(truthValues)
    truthValues.forEach(e => {
        e.value = e.value || 1
    })
})

const buttonCreateMap = document.querySelector('[createmap]')
buttonCreateMap.addEventListener('click', () => {
    events.group = false
    events.simplify = false
    const container = document.querySelector('.container')
    const truthValues = document.querySelectorAll('.truthtable-body input')
    const rightContainer = document.querySelector('.right-side')
    const containerKarnaughmap = rightContainer.querySelector('.container-karnaughmap')
    if(containerKarnaughmap){
        const simexp = rightContainer.querySelector('.simplifiedexpression')
        if(simexp)
            simexp.remove()
        containerKarnaughmap.remove()
    }
    let truthTableComplete = 2
    truthValues.forEach(e => {
        if(!e.value)
            truthTableComplete = 0
    })
    if(truthValues.length === 0) truthTableComplete = 1
    if(truthTableComplete === 2){
        container.classList.add('container-simplified')
        const divContainer = document.createElement('div')
        const divButtons = document.createElement('div')
        const divCell = document.createElement('div')
        const divRow = document.createElement('div')
        const divColumn = document.createElement('div')
        const table = document.createElement('table')
        const tbody = document.createElement('tbody')
        const buttonGroupMap = document.createElement('button')
        const buttonCreateMap = document.createElement('button')
        const variables = document.querySelector('.selected').innerText
        const step = Math.round(variables/2)
        const mapping = karnaughmap() // Recebe um mapeamento da tabela
        rightContainer.appendChild(divContainer)
        divContainer.appendChild(divCell)
        divContainer.appendChild(divRow)
        divContainer.appendChild(divColumn)
        divContainer.appendChild(divButtons)
        divContainer.appendChild(table)
        divButtons.appendChild(buttonGroupMap)
        divButtons.appendChild(buttonCreateMap)
        table.appendChild(tbody)
        divContainer.classList.add('container-karnaughmap')
        divButtons.classList.add('karnaughmap-buttons')
        buttonGroupMap.setAttribute('group-map', '')
        buttonGroupMap.innerText = 'Agrupar'
        buttonCreateMap.setAttribute('simplify-map', '')
        buttonCreateMap.innerText = 'Simplificar'
        divRow.classList.add('karnaughmap-row')
        divColumn.classList.add('karnaughmap-column')
        table.classList.add('karnaughmap')
        tbody.classList.add('karnaughmap-body')

        // Esse laço cria uma tabela vazia que representa o mapa de karnaugh e adiciona os caracteres da linha e coluna externa.
        for(let i = 0; i < variables; i+=step){ 
            const aux = Math.min(i+step, variables)-i
            let columnComplete = false // Verfica se a coluna externa ja foi completada
            if(i == step)
                columnComplete = true
            switch(aux){  // 'aux' armazena quantas varaiveis vao ser representadas na coluna ou linha externa
                case 1:
                    oneVariable.forEach((e, index) => {
                        const p = document.createElement('p')
                        const span = document.createElement('span')
                        const div= document.createElement('div')
                        const bit = e.split('') // bit armazena a ordem do '0' e '1'
                        bit.forEach((b, bindex) => {
                            if(b === '0'){
                                const span = document.createElement('span')
                                span.classList.add('overline')
                                span.textContent = caracteres[i+bindex]
                                div.appendChild(span)
                            }
                            if(b === '1'){
                                const span = document.createElement('span')
                                span.textContent = caracteres[i+bindex]
                                div.appendChild(span)
                            }
                        })
                        p.appendChild(div)
                        span.textContent = e
                        p.appendChild(span)
                        if(columnComplete){
                            const rows = tbody.querySelectorAll('tr')
                            rows.forEach(e => {
                                const newCell = e.insertCell()
                                newCell.setAttribute('column', `${index}`)
                            })
                            divRow.appendChild(p)
                        }else{
                            const newRow = tbody.insertRow()
                            newRow.setAttribute('row', `${index}`)
                            divColumn.appendChild(p) 
                        }
                    })
                    break;
                case 2:
                    twoVariables.forEach((e, index) => {
                        const p = document.createElement('p')
                        const div = document.createElement('div')
                        const span = document.createElement('span')
                        const bit = e.split('') // bit armazena a ordem do '0' e '1'
                        bit.forEach((b, bindex) => {
                            if(b === '0'){
                                const span = document.createElement('span')
                                span.classList.add('overline')
                                span.textContent = caracteres[i+bindex]
                                div.appendChild(span)
                            }
                            if(b === '1'){
                                const span = document.createElement('span')
                                span.textContent = caracteres[i+bindex]
                                div.appendChild(span)
                            }
                        })
                        p.appendChild(div)
                        span.textContent = e
                        p.appendChild(span)
                        if(!columnComplete){
                            const newRow = tbody.insertRow()
                            newRow.setAttribute('row', `${index}`)
                            divColumn.appendChild(p)
                        }else{
                            const rows = tbody.querySelectorAll('tr')
                            rows.forEach(e => {
                                const newCell = e.insertCell()
                                newCell.setAttribute('column', `${index}`)
                            })
                            divRow.appendChild(p)
                        }
                    })
                    break;
                case 3:
                    console.log('indisponivel')
                    break;
            }
        }

        // Coloca os valores mapeados na tabela, da última coluna, no mapa de karnaugh
        mapping.forEach((e, index) => { 
            let row, column, string = ''
            const values = Object.values(e)
            switch(step){
                case 1:
                    for(let i = 0; i < step; i++)
                        string+=values[i]
                    row = oneVariable.indexOf(string)
                    string = ''
                    for(let i = step; i < variables; i++)
                        string+=values[i]
                    column = oneVariable.indexOf(string)
                    break;
                case 2:
                    for(let i = 0; i < step; i++)
                        string+=values[i]
                    row = twoVariables.indexOf(string)
                    string = ''
                    for(let i = step; i < variables; i++)
                        string+=values[i]
                    if(variables-step === 2)
                        column = twoVariables.indexOf(string)
                    else
                        column = oneVariable.indexOf(string)
                    break;
            }
            const cell = tbody.querySelector(`tr[row='${row}'] td[column='${column}']`)
            cell.innerText = values[values.length-1] // Pega o valor da última propriedade do objeto e atribui à célula.
        })

        let groupedMap
        const groupedKarnaughMap = new Promise((resolve) => {
            buttonGroupMap.addEventListener('click', () => resolve(groupsKarnaughMap()))
        })
        groupedKarnaughMap
        .then(gkm => {
            let zIndexMax = 0, groupNumber = 1 // 'zIndexMax' armazena o maior <z-index> da tabela e 'groupNumber' o n-esimo grupo
            // Esse laço personaliza (adiciona bordas) para os agrupamentos
            gkm.forEach((group, gindex) => {
                group.forEach(e => {
                    let gs = groupSize(gindex)
                    console.log(`gs: ${gs}`)
                    for(let j = 0; j < gs[0]; j++){
                        const cell = tbody.rows[e[j].rindex].cells[e[j].cindex]
                        const a = document.createElement('a')
                        a.style.zIndex = 1
                        a.setAttribute(`${gs[1]}-case${e[e.length-1]}`, `${j}`)
                        a.classList.add(`group${groupNumber}`)
                        a.classList.add('item')
                        cell.appendChild(a)
                        a.addEventListener('mouseenter', () => {
                            const gn = [...a.classList].find(cls => cls.startsWith('group')) // gn - group number
                            document.querySelectorAll(`.${gn}`).forEach(el => {
                                console.log(el)
                                el.style.zIndex = 20
                                el.classList.add('hover-group')})
                        })
                        a.addEventListener('mouseleave', () => {
                            const gn = [...a.classList].find(cls => cls.startsWith('group'));
                            document.querySelectorAll(`.${gn}`).forEach(el => {
                                el.style.zIndex = 1
                                el.classList.remove('hover-group')})
                        })
                    }
                    zIndexMax++
                    groupNumber++
                })
            })
            groupedMap = gkm
            events.group = true
        })

        // Aparitr do mapa de karnaugh, cria a expressão simplificada
        const buttonSimplifyMap = document.querySelector('[simplify-map]')
        const simplifiedE = document.createElement('p') // Simplified Expression
        const divSimplified = document.createElement('div')
        simplifiedE.append('X = ')
        divSimplified.classList.add('simplifiedexpression')
        buttonSimplifyMap.addEventListener('click', () => {
            if(truthTableComplete && events.group && !events.simplify){
                groupedMap.forEach((group, gindex) => {
                    let expression = '', gs = groupSize(gindex)
                    if(gs[0] === 0){ // grupo isolado
                        group.forEach((e, j) => {
                            let expression = document.createElement('p')
                            if(simplifiedE.lastElementChild !== null)
                                simplifiedE.append(' + ')
                            divColumn.children[e[0].rindex].querySelectorAll('span').forEach((e, i, t) => {
                                if(i !== t.length-1)
                                    simplifiedE.appendChild(e.cloneNode(true))
                            })
                            divRow.children[e[0].cindex].querySelectorAll('span').forEach((e, i, t) => {
                                if(i !== t.length-1)
                                    simplifiedE.appendChild(e.cloneNode(true))
                            })
                        })
                    } else { // demais grupos
                        group.forEach(e => {
                            let expression = document.createElement('p')
                            const spansPorTexto = {}
                            if(simplifiedE.lastElementChild !== null)
                                simplifiedE.append(' + ')
                            for(let j = 0; j < gs[0]; j++){
                                divColumn.children[e[j].rindex].querySelectorAll(':not(:last-child)').forEach(e => expression.appendChild(e.cloneNode(true)))
                                divRow.children[e[j].cindex].querySelectorAll(':not(:last-child)').forEach(e => expression.appendChild(e.cloneNode(true)))
                            }
                            const final = expression.querySelectorAll('span')
                            final.forEach(span => {
                                const texto = span.textContent.trim(); // Obter o texto interno do span
                                if (!spansPorTexto[texto]) {
                                    spansPorTexto[texto] = {true: [0], false: [0]};
                                    spansPorTexto[texto][span.classList.contains('overline')][0] = 1
                                    spansPorTexto[texto][span.classList.contains('overline')][1] = span
                                } else {
                                    spansPorTexto[texto][span.classList.contains('overline')][0] = 1
                                    spansPorTexto[texto][span.classList.contains('overline')][1] = span
                                }
                            })
                            for(let text in spansPorTexto){
                                const e = spansPorTexto[text]
                                if(!(e.true[0] === 1 && e.false[0] === 1)){
                                    if(e.true[0] === 1)
                                        simplifiedE.appendChild(e.true[1])
                                    if(e.false[0] === 1)
                                        simplifiedE.appendChild(e.false[1])
                                }
                            }
                            if(simplifiedE.lastChild.tagName !== 'SPAN')
                                simplifiedE.append('1')
                        })
                    }
                })
                divSimplified.appendChild(simplifiedE)
                rightContainer.appendChild(divSimplified)
                setTimeout(() => {
                    divSimplified.classList.add('show');
                }, 50);
                events.simplify = true
            }
        })
    }else{
        console.log('Complete a tabela!')
    }
})

const png = document.querySelector('[file-format="png"]')
png.addEventListener('click', event => {
    const table = document.querySelector('.truthtable-body');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Ajusta o tamanho do canvas ao tamanho da tabela
    const rect = table.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Estilize a tabela no canvas
    context.font = '16px Arial';
    context.textAlign = 'left';
    context.fillStyle = '#000';

    // Copia conteúdo da tabela
    Array.from(table.rows).forEach((row, rowIndex) => {
    Array.from(row.cells).forEach((cell, cellIndex) => {
        const x = cellIndex * (rect.width / row.cells.length);
        const y = rowIndex * 30; // Altura estimada de uma linha
        context.fillText(cell.textContent, x + 10, y + 20);
    });
    });

    // Converte o canvas para uma imagem
    const link = document.createElement('a');
    link.download = 'tabela.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
})

// const tab = document.querySelector('[data-create-tab]')
// tab.addEventListener('click', e => {
//     const divTabs = document.querySelector('.tabs')
//     const penultimateChild = divTabs.children[divTabs.children.length - 2]
//     const tabNumber = penultimateChild.getAttribute('data-tab')*1+1
//     if(tabNumber <= 3){
//         const newTab = document.createElement('div')
//         const tableTitle = document.querySelector('.truthtable-head-select h1')
//         newTab.classList.add('tab', 'active')
//         newTab.setAttribute('data-tab', `${tabNumber}`)
//         newTab.innerHTML = `Aba ${tabNumber}<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/></svg>`
//         // tableTitle.innerText += ` ${tabNumber}`
//         penultimateChild.after(newTab)
//         if(tabNumber === 3)
//             newTab.nextElementSibling.remove()
//         const svg = newTab.querySelector('svg')
//         svg.addEventListener('click', e => {
//             let previousSibling = newTab
//             let nextSibling = newTab.nextElementSibling
//             while(nextSibling){
//                 nextSibling.innerHTML = previousSibling.innerHTML
//                 previousSibling = nextSibling
//                 nextSibling = nextSibling.nextElementSibling
//             }
//             newTab.classList.add('removed')
//             setTimeout(() => {
//                 newTab.remove()
//             }, 300); // O tempo aqui deve ser igual ao tempo de transição do CSS
//         })
//     }
// })