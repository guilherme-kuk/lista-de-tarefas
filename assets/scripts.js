let inputTarefa = document.querySelector('.tarefa');
let inputData = document.querySelector('.data');
let btnAdd = document.querySelector('.btn-add');
let janelaTarefas = document.querySelector('.janela-tarefas');

let bgEdicao = document.querySelector('#bg-edicao');
let janelaEdicao = document.querySelector('#janela-edicao');
let btnFecharJanelaEdicao = document.querySelector('#janela-btn-fechar');

let idTarefaEditar = document.querySelector('#id-tarefa-editar');
let inputTarefaEditar = document.querySelector('.editar-tarefa');
let inputDataEditar = document.querySelector('.data-editar');
let btnAtualizarTarefa = document.querySelector('.btn-atualizar');

const KEY_CODE_ENTER = 13;
const KEY_LOCAL_STORAGE = 'janela-tarefas';

let db = [];


// Criando estrutura para cada nova tarefa.
function criarItem(tarefa) {
    let novaTarefa = document.createElement('div');
    novaTarefa.classList.add('row');
    novaTarefa.classList.add('tarefa-adicionada');
    novaTarefa.setAttribute('id', tarefa.id)
    novaTarefa.innerHTML = `
        <div class="col-lg-8 item-nome">
            <span id="spanNome-${tarefa.id}">${tarefa.nome}</span>
            <br>
            <small id="smallData-${tarefa.id}">${tarefa.data}</small>
        </div>
        <div class="col-lg-2 item-btn">
            <button id="editar-${tarefa.id}" class="btn-editar" onclick="editarTarefa(${tarefa.id})">
                <i class="fa-solid fa-pencil"></i>
            </button>
            <button class="btn-apagar" onclick="apagar(${tarefa.id})">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>`;

    document.getElementById('listaTarefas').appendChild(novaTarefa);
    inputTarefa.value = '';
    inputData.value = '';
    inputTarefa.focus();

    return novaTarefa;

}

function addTarefa(tarefa) {
    db.push(tarefa);
    salvarTarefaDB();
    obterTarefas();
}

function formatarData() {
    let dataInput = inputData.value;

    if (dataInput == '') {
        return dataInput;

    } else {
        let data = new Date(dataInput);

        let dataFormatada = Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeZone: 'UTC',
        })

        console.log(dataFormatada.format(data));
        return dataFormatada.format(data);
    }
}

function formatarDataEdicao() {
    let dataInputEditar = inputDataEditar.value;

    if (dataInputEditar == '') {
        return dataInputEditar;
    } else {
        let data2 = new Date(dataInputEditar);
        let dataFormatada2 = Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeZone: 'UTC',
        });
        return dataFormatada2.format(data2);
    }
}

// Adicionar tarefa com mouse
btnAdd.addEventListener('click', function () {
    if (inputTarefa.value == '') {
        alert('Informe o nome da Tarefa');
    } else {
        let tarefa = {
            nome: inputTarefa.value,
            id: gerarId(),
            data: formatarData(),
        };

        addTarefa(tarefa);
        inputDataEditar.value = '';
    }
});

// Adicionar tarefa pelo enter
document.addEventListener('keypress', function (e) {
    if (e.keyCode === KEY_CODE_ENTER) {
        if (inputTarefa.value == '') {
            alert('Informe o nome da Tarefa');
        } else {
            let tarefa = {
                nome: inputTarefa.value,
                id: gerarId(),
                data: formatarData(),
            };

            addTarefa(tarefa);
            inputDataEditar.value = '';
        }
    }
});

// Gerar ID para tarefas
function gerarId() {
    return Math.floor(Math.random() * 200);
}

// Editar tarefa adicionada.
function editarTarefa(idTarefa) {
    alternarJanelaEdicao();
    let item = document.getElementById(idTarefa);
    let nomeTarefa = document.getElementById('spanNome-' + idTarefa);
    let dataTarefa = document.getElementById('smallData-' + idTarefa);

    dataTarefa = JSON.stringify(dataTarefa.innerText);
    dataTarefa = dataTarefa.substring(1, 11).split('/').reverse().join('-');

    if (item) {
        idTarefaEditar.innerHTML = '#' + idTarefa;
        inputTarefaEditar.value = nomeTarefa.innerText;
        inputDataEditar.value = dataTarefa;
    }
}

// Apagar tarefa
function apagar(idTarefa) {

    let confirmarExclusao = window.confirm('Tem certeza que deseja excluir esta tarefa?');

    if (confirmarExclusao) {

        const indiceTarefa = obterIndiceTarefaPorID(idTarefa);
        db.splice(indiceTarefa, 1);
        salvarTarefaDB();

        let tarefa = document.getElementById(idTarefa);
        tarefa.remove();
    }

}

//Abrir e fechar janela edição de Tarefa pelo X.
btnFecharJanelaEdicao.addEventListener('click', function () {
    alternarJanelaEdicao();
});

// Fechar janela edição de Tarefa pelo background.
bgEdicao.addEventListener('click', function () {
    alternarJanelaEdicao();
});

// Fechar janela edição de Tarefa pelo ESC
document.addEventListener('keyup', function (e) {
    if (e.key === 'Escape') {
        bgEdicao.classList.remove('abrir');
        janelaEdicao.classList.remove('abrir');
        inputTarefa.focus();
    }
})

// função para remover classe 'abrir' e voltar tela principal.
function alternarJanelaEdicao() {
    bgEdicao.classList.toggle('abrir');
    janelaEdicao.classList.toggle('abrir');
}

// Atualizar nome da tarefa editada
btnAtualizarTarefa.addEventListener('click', function (e) {
    e.preventDefault();
    let tarefaAdicionada = document.getElementById('listaTarefas');

    let idTarefa = idTarefaEditar.innerHTML.replace('#', '');

    if (inputTarefaEditar.value == '') {
        alternarJanelaEdicao();

    } else {
        let tarefa = {
            nome: inputTarefaEditar.value,
            id: idTarefa,
            data: formatarDataEdicao(),
        };

        let tarefaAtual = document.getElementById(idTarefa);

        const indiceTarefa = obterIndiceTarefaPorID(idTarefa);
        db[indiceTarefa] = tarefa;
        salvarTarefaDB();

        if (inputDataEditar.value == '') {
            let confirmarAtualizacao = window.confirm('Esta tarefa será atualizada sem data, deseja continuar?');
            if (confirmarAtualizacao) {
                let item = criarItem(tarefa);
                tarefaAdicionada.replaceChild(item, tarefaAtual);
                alternarJanelaEdicao();
            }
        } else {
            let item = criarItem(tarefa);
            tarefaAdicionada.replaceChild(item, tarefaAtual);
            alternarJanelaEdicao();
        }
    }


});

function obterIndiceTarefaPorID(idTarefa) {
    let indiceTarefa = db.findIndex(tarefa => tarefa.id == idTarefa);
    if (indiceTarefa < 0) {
        throw new Error('ID da tarefa não encontrada: ', idTarefa);
    }

    return indiceTarefa;
}

// Salvando tarefas no LocalStorage
function salvarTarefaDB() {
    localStorage.setItem(KEY_LOCAL_STORAGE, JSON.stringify(db));
}

// renderizando tarefas na tela.
function obterTarefas() {
    janelaTarefas.innerHTML = `
        <div id="title-tarefas" class="row">
            <h2>Tarefas adicionadas:</h2>
        </div>`;
    if (localStorage.getItem(KEY_LOCAL_STORAGE)) {
        db = JSON.parse(localStorage.getItem(KEY_LOCAL_STORAGE));
        db.forEach(item => criarItem(item));
    }
}

obterTarefas();