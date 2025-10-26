// script.simple.js
// Versão comentada linha-a-linha para uso em aula
// Objetivo: listar alunos da API e permitir exclusão usando Fetch

// URL base da API (mudar se for necessário)
const API = 'https://proweb.leoproti.com.br/alunos';

// ----- Seletores rápidos (atalhos para o DOM) -----
// $('seletor') -> retorna o primeiro elemento que casa com o seletor
const $ = s => document.querySelector(s);
// $$('seletor') -> retorna NodeList com todos os elementos que casam
const $$ = s => document.querySelectorAll(s);

// ----- Elementos usados na página -----
// tbody da tabela onde os alunos serão inseridos
const tbody = $('#alunos-table tbody');
// div que mostra o estado de carregamento
const loading = $('#loading');
// div usada para mostrar mensagens ao usuário
const message = $('#message');

// ----- Funções utilitárias -----
// Alterna o indicador de 'loading' (mostrar/ocultar)
function setLoading(on) {
    if (!loading) return; // Evita erro se não existir o elemento
    loading.style.display = on ? 'block' : 'none';
}

// Mostra uma mensagem curta (tipo: 'success' ou 'error') e some após 3s
function showMessage(text, type = 'success') {
    if (!message) return;
    message.textContent = text;
    message.className = type === 'success' ? 'alert alert-success' : 'alert alert-danger';
    message.style.display = 'block';
    setTimeout(() => { message.style.display = 'none'; }, 3000);
}

// Função genérica para chamar a API e retornar um objeto com {ok,status,data}
async function callApi(path = '', opts = {}) {
    const res = await fetch(API + path, {
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        ...opts
    });
    const txt = await res.text();
    try {
        return { ok: res.ok, status: res.status, data: txt ? JSON.parse(txt) : null };
    } catch (e) {
        return { ok: res.ok, status: res.status, data: txt };
    }
}

// ----- Carregar dados -----
// Busca os alunos e chama 'renderizar' para mostrar na tabela
async function carregarAlunos() {
    setLoading(true);
    try {
        const r = await callApi(''); // GET /alunos
        if (r.ok && Array.isArray(r.data)) renderizar(r.data);
        else renderizar([]);
    } catch (e) {
        // Dados de exemplo para modo offline
        renderizar([
            { id: 1, nome: 'Maria Silva', turma: 'A1', curso: 'Informática', matricula: '2023001' },
            { id: 2, nome: 'João Souza', turma: 'B2', curso: 'Administração', matricula: '2023002' }
        ]);
        showMessage('Modo offline: usando dados de exemplo', 'error');
    } finally {
        setLoading(false);
    }
}

// ----- Renderizar tabela -----
// Recebe um array de alunos e popula o tbody
function renderizar(alunos) {
    tbody.innerHTML = '';
    if (!alunos || alunos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Nenhum aluno</td></tr>';
        return;
    }

    alunos.forEach(a => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${a.id}</td>
            <td>${a.nome}</td>
            <td>${a.turma}</td>
            <td>${a.curso}</td>
            <td>${a.matricula}</td>
            <td>
                <a class="btn btn-sm btn-primary" href="form.html?id=${a.id}">Editar</a>
                <button class="btn btn-sm btn-danger btn-delete" data-id="${a.id}" data-nome="${a.nome}">Excluir</button>
            </td>`;
        tbody.appendChild(tr);
    });

   // Adiciona eventos de exclusão
    $$('.btn-delete').forEach(btn => btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const nome = btn.dataset.nome;
        if (confirm(`Excluir aluno "${nome}"?`)) excluirAluno(id);
    }));

}

// ----- Excluir aluno -----
// Envia DELETE /alunos/{id} e recarrega a lista se sucesso
async function excluirAluno(id) {
    setLoading(true);
    try {
        const r = await callApi('/' + id, { method: 'DELETE' });
        if (r.ok) {
            showMessage('Aluno excluído com sucesso', 'success');
            carregarAlunos();
        } else {
            showMessage('Erro ao excluir aluno', 'error');
        }
    } catch (e) {
        showMessage('Erro de conexão', 'error');
    } finally {
        setLoading(false);
    }
}

// ----- Inicialização -----
// Quando o DOM estiver pronto, executa carregarAlunos()
window.addEventListener('DOMContentLoaded', carregarAlunos);