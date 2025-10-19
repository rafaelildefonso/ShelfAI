// Arquivo de diagnóstico para verificar dados do localStorage
// Execute este código no console do navegador para diagnosticar o problema

console.log('=== DIAGNÓSTICO DO LOCALSTORAGE ===');

// Verificar dados atuais
const userData = localStorage.getItem('user');
const tokenData = localStorage.getItem('token');

console.log('Dados brutos do localStorage:');
console.log('Token:', tokenData);
console.log('User (string):', userData);

// Tentar fazer parse
try {
  const parsedUser = JSON.parse(userData);
  console.log('User (parsed):', parsedUser);

  // Verificar se é um JSON duplo
  if (typeof parsedUser === 'string') {
    console.log('⚠️  ENCONTRADO JSON DUPLO!');
    const doubleParsed = JSON.parse(parsedUser);
    console.log('Dados reais:', doubleParsed);
  } else if (parsedUser && parsedUser.user) {
    console.log('⚠️  ENCONTRADO OBJETO ANINHADO!');
    console.log('Dados reais:', parsedUser.user);
  }
} catch (error) {
  console.error('Erro ao fazer parse:', error);
}

console.log('=== FIM DO DIAGNÓSTICO ===');
