// form.js - versão ajustada para campos: nome, turma, curso, matricula

// ----- Configuração -----
const API = 'https://proweb.leoproti.com.br/alunos';
const $ = s => document.querySelector(s);

// ----- Referências aos campos do formulário -----
const idField = $('#Aluno-id');    
const nomeField = $('#nome');        
const turmaField = $('#turma');
const cursoField = $('#curso');
const matriculaField = $('#matricula');      
const form = $('#aluno-form');     
const message = $('#message');       

// ----- Função para mostrar mensagens -----
function showMessage(text, type = 'success'){
  if(!message) return;
  message.textContent = text;
  message.className = type === 'success' ? 'alert alert-success' : 'alert alert-danger';
  message.style.display = 'block';
  setTimeout(()=> message.style.display = 'none', 3000);
}

// ----- Função genérica para chamar a API -----
async function callApi(path = '', opts = {}){
  const res = await fetch(API + path, { 
    mode: 'cors', 
    headers: { 'Content-Type': 'application/json' }, 
    ...opts 
  });
  const txt = await res.text();
  try { return { ok: res.ok, status: res.status, data: txt ? JSON.parse(txt) : null }; }
  catch(e) { return { ok: res.ok, status: res.status, data: txt }; }
}

// ----- Carregar aluno para edição -----
async function carregar(id){
  try{
    const r = await callApi('/' + id);
    if(r.ok && r.data){
      idField.value = r.data.id;
      nomeField.value = r.data.nome;
      turmaField.value = r.data.turma;
      cursoField.value = r.data.curso;
      matriculaField.value = r.data.matricula;
      const title = document.getElementById('form-title'); 
      if(title) title.textContent = 'Editar Aluno';
    } else showMessage('Aluno não encontrado','error');
  }catch(e){
    showMessage('Erro ao carregar aluno','error');
    console.error(e);
  }
}

// ----- Salvar (criar ou atualizar) -----
async function salvar(e){
  e.preventDefault();

  // Monta o objeto aluno a partir dos campos
  const aluno = {
    nome: nomeField.value.trim(),
    turma: turmaField.value.trim(),
    curso: cursoField.value.trim(),
    matricula: matriculaField.value.trim()
  };

  // Validação simples
  if(!aluno.nome || !aluno.turma || !aluno.curso || !aluno.matricula){ 
    showMessage('Preencha todos os campos','error'); 
    return; 
  }

  try{
    if(idField.value){
      // Modo edição
      const r = await callApi('/' + idField.value, { method: 'PUT', body: JSON.stringify(aluno) });
      if(r.ok) {
        showMessage('Aluno atualizado','success');
        setTimeout(()=> location.href = 'index.html', 700);
      } else showMessage('Erro ao atualizar','error');
    } else {
      // Modo criação
      const r = await callApi('', { method: 'POST', body: JSON.stringify(aluno) });
      if(r.ok) {
        showMessage('Aluno criado','success');
        setTimeout(()=> location.href = 'index.html', 700);
      } else showMessage('Erro ao criar','error');
    }
  }catch(e){
    showMessage('Erro de conexão','error');
    console.error(e);
  }
}

// ----- Inicialização -----
form.addEventListener('submit', salvar);

// Se houver ?id= na URL, carrega o aluno para edição
const params = new URLSearchParams(location.search); 
if(params.has('id')) carregar(params.get('id'));
