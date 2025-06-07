fetch('https://v0-new-project-wndpayl978c.vercel.app/api/flights-complete')
  .then(res => res.json())
  .then(data => {
    if (!data.success || !data.data.arrivals.length) {
      document.getElementById('flights').innerText = 'Nenhum voo encontrado.';
      return;
    }
    const html = data.data.arrivals.map(flight => `
      <div class="flight">
        <strong>${flight.ident}</strong> — ${flight.origin.city} → ${flight.destination.city}
        <br>Status: ${flight.status}
        <br>Previsto: ${new Date(flight.estimated_in).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
      </div>
    `).join('');
    document.getElementById('flights').innerHTML = html;
  })
  .catch(() => {
    document.getElementById('flights').innerText = 'Erro ao carregar os voos.';
  });