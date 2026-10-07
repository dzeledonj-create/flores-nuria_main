/**
 * Vista de informes: pide los datos al ReporteController y dibuja los gráficos con D3.
 */
const createTooltip = () => {
  const tooltip = d3.select('body')
    .append('div')
    .attr('class', 'chart-tooltip');
  return tooltip;
};

const drawLineChart = (containerId, data) => {
  const container = document.getElementById(containerId);
  if (!container || data.length === 0) return;

  const margin = { top: 20, right: 24, bottom: 40, left: 54 };
  const width = container.clientWidth - margin.left - margin.right;
  const height = container.clientHeight - margin.top - margin.bottom;
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scalePoint()
    .domain(data.map(d => d.mes))
    .range([0, width])
    .padding(0.5);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.total) * 1.1])
    .nice()
    .range([height, 0]);

  const xAxis = d3.axisBottom(x);
  const yAxis = d3.axisLeft(y).ticks(5).tickFormat(d => `€ ${d}`);

  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis)
    .selectAll('text')
    .attr('transform', 'rotate(-40)')
    .style('text-anchor', 'end');

  svg.append('g')
    .call(yAxis);

  const line = d3.line()
    .x(d => x(d.mes))
    .y(d => y(d.total))
    .curve(d3.curveMonotoneX);

  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#3f51b5')
    .attr('stroke-width', 3)
    .attr('d', line);

  const tooltip = createTooltip();

  svg.selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', d => x(d.mes))
    .attr('cy', d => y(d.total))
    .attr('r', 5)
    .attr('fill', '#3f51b5')
    .on('mousemove', (event, d) => {
      tooltip.style('opacity', 1)
        .html(`<strong>${escapeHtml(d.mes)}</strong><br>Ventas: € ${d.total.toFixed(2)}`)
        .style('left', `${event.pageX + 14}px`)
        .style('top', `${event.pageY - 28}px`);
    })
    .on('mouseleave', () => tooltip.style('opacity', 0));
};

const drawBarChart = (containerId, data) => {
  const container = document.getElementById(containerId);
  if (!container || data.length === 0) return;

  const margin = { top: 20, right: 20, bottom: 60, left: 50 };
  const width = container.clientWidth - margin.left - margin.right;
  const height = container.clientHeight - margin.top - margin.bottom;
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(data.map(d => d.estado))
    .range([0, width])
    .padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count) * 1.2])
    .nice()
    .range([height, 0]);

  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('transform', 'rotate(-35)')
    .style('text-anchor', 'end');

  svg.append('g')
    .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('d')));

  const tooltip = createTooltip();

  svg.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.estado))
    .attr('y', d => y(d.count))
    .attr('width', x.bandwidth())
    .attr('height', d => height - y(d.count))
    .attr('fill', '#ff9800')
    .on('mousemove', (event, d) => {
      tooltip.style('opacity', 1)
        .html(`<strong>${escapeHtml(d.estado)}</strong><br>Cantidad: ${d.count}`)
        .style('left', `${event.pageX + 14}px`)
        .style('top', `${event.pageY - 28}px`);
    })
    .on('mouseleave', () => tooltip.style('opacity', 0));
};

const drawGroupedBarChart = (containerId, data) => {
  const container = document.getElementById(containerId);
  if (!container || data.length === 0) return;

  const margin = { top: 24, right: 24, bottom: 90, left: 58 };
  const width = container.clientWidth - margin.left - margin.right;
  const height = container.clientHeight - margin.top - margin.bottom;
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const subgroups = ['ventas', 'pedidos'];
  const groups = data.map(d => d.producto);

  const x0 = d3.scaleBand()
    .domain(groups)
    .range([0, width])
    .padding(0.2);

  const x1 = d3.scaleBand()
    .domain(subgroups)
    .range([0, x0.bandwidth()])
    .padding(0.05);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => Math.max(d.ventas, d.pedidos)) * 1.2])
    .nice()
    .range([height, 0]);

  const color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(['#1976d2', '#d32f2f']);

  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x0))
    .selectAll('text')
    .attr('transform', 'rotate(-40)')
    .style('text-anchor', 'end');

  svg.append('g')
    .call(d3.axisLeft(y).ticks(6));

  const tooltip = createTooltip();

  svg.append('g')
    .selectAll('g')
    .data(data)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${x0(d.producto)},0)`)
    .selectAll('rect')
    .data(d => subgroups.map(key => ({ key, value: d[key], producto: d.producto })))
    .enter()
    .append('rect')
    .attr('x', d => x1(d.key))
    .attr('y', d => y(d.value))
    .attr('width', x1.bandwidth())
    .attr('height', d => height - y(d.value))
    .attr('fill', d => color(d.key))
    .on('mousemove', (event, d) => {
      tooltip.style('opacity', 1)
        .html(`<strong>${escapeHtml(d.producto)}</strong><br>${d.key}: ${d.value}`)
        .style('left', `${event.pageX + 14}px`)
        .style('top', `${event.pageY - 28}px`);
    })
    .on('mouseleave', () => tooltip.style('opacity', 0));

  const legend = svg.append('g')
    .attr('transform', `translate(0, -12)`);

  subgroups.forEach((key, index) => {
    const legendItem = legend.append('g')
      .attr('transform', `translate(${index * 140}, 0)`);

    legendItem.append('rect')
      .attr('width', 14)
      .attr('height', 14)
      .attr('fill', color(key));

    legendItem.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .text(key === 'ventas' ? 'Ventas' : 'Pedidos')
      .attr('fill', '#333')
      .attr('font-size', '0.9rem');
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  const respuesta = await api('reportes', 'datos');
  if (!respuesta.ok) {
    showMessage(respuesta.message, false);
    return;
  }
  drawLineChart('sales-line-chart', respuesta.data.ventas);
  drawBarChart('orders-bar-chart', respuesta.data.pedidos);
  drawGroupedBarChart('product-grouped-chart', respuesta.data.productos);
});
