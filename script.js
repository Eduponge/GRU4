fetch('https://v0-new-project-wndpayl978c.vercel.app/api/flights-complete')
  .then(res => res.json())
  .then(data => {
    if (!data.success || (!data.data.arrivals.length && !data.data.departures.length)) {
      document.getElementById('flights').innerText = 'Nenhum voo encontrado.';
      return;
    }

    let html = '';

    if (data.data.arrivals.length) {
      html += '<h2>Chegadas</h2>';
      html += data.data.arrivals.map(flight => `
        <div class="flight">
          <strong>${flight.ident}</strong> — ${flight.origin.city} → ${flight.destination.city}
          <br>Status: ${flight.status}
          <br>Previsto: ${new Date(flight.estimated_in).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
        </div>
      `).join('');
    }

    if (data.data.departures.length) {
      html += '<h2>Partidas</h2>';
      html += data.data.departures.map(flight => `
        <div class="flight">
          <strong>${flight.ident}</strong> — ${flight.origin.city} → ${flight.destination.city}
          <br>Status: ${flight.status}
          <br>Previsto: ${new Date(flight.estimated_out).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
        </div>
      `).join('');
    }

    document.getElementById('flights').innerHTML = html;
  })
  .catch(() => {
    document.getElementById('flights').innerText = 'Erro ao carregar os voos.';
  });
