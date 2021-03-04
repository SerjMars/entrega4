////GRÁFICO DE STOCKS
graf = d3.select('#graf')
ancho_total = graf.style('width').slice(0, -2)
alto_total  = ancho_total * 0.5625
margins = {
  top: 20,
  left: 50,
  right: 20,
  bottom: 20
}
ancho = ancho_total - margins.left - margins.right
alto  = alto_total - margins.top - margins.bottom

////ESPACIO DE VISUALIZACIÒN. TODO LO DEMÁS ESTARÁ AQUÍ DENTRO
svg = graf.append('svg')
          .style('width', `${ ancho_total }px`)
          .style('height', `${ alto_total }px`)

////PRIMER GRUPO (O CAPA) DE VISUALIZACIÓN. SIRVE PARA DEFINIR
////EL TAMAÑO DEL ESPACIO PARA GRAFICAR
g = svg.append('g')
        .attr('transform', `translate(${ margins.left }, ${ margins.top })`)
        .attr('width', ancho + 'px')
        .attr('height', alto + 'px')

////SEGUNDO GRUPO (O CAPA) DE VISUALIZACIÓN). EN ESTA CAPA SE MUESTRA EL GRÁFICO.
svg.append('rect')
        .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')')
        .attr('fill', 'gray')
        .attr('fill-opacity', 0.05)
        .attr('width', ancho)
        .attr('height', alto)
        .on('mouseover', function() { focus.style("display", null); })
        .on('mouseout', function() { focus.style("display", "none"); })
        .on('mousemove', e => mousemove(e))

//DEFINIMOS UN NUEVO GRUPO LLAMADO "FOCUS"
//INCLUIDO EN EL OBJETO 'G'
focus = g.append('g')
          .attr('class', 'focus')
          .style('display', 'none')
focus.append('line')
      .attr('class', 'y-hover-line hover-line')
      .attr('stroke-opacity', 0.35)
focus.append('line')
      .attr('class', 'x-hover-line hover-line')
      .attr('stroke-opacity', 0.35)
focus.append('circle')
      .attr('r', 5)
      .attr('fill', 'black')
      .attr('fill-opacity', 0.35)
focus.append('text')
      .attr('x', 15)
      .attr('dy', '.31em')

//AÑADIMOS A 'G' U NUEVO OBJETO 'RECT'
g.append('rect')
  .attr('x', 10)
  .attr('y', 10)
  .attr('fill', '#c2c3c4')
  .attr('stroke', '#9fa0a1')
  .attr('width', 80)
  .attr('height', 30)

g.append('text')
  .attr('x', 20)
  .attr('y', 30)
  .text('Valor:')
  .attr('font-family', 'monospace')


////ESCALADORES DEL EJE X, EJE Y, DE COLOR
x = d3.scaleTime().range([0, ancho])
y = d3.scaleLinear().range([alto, 0])
color = d3.scaleOrdinal()
          .domain(['meli', 'pdd', 'baba'])
          .range(['gold', 'green', 'red'])

////CREAMOS LOS ELEMENTOS "EJES"
xAxis = g.append('g')
          .attr('transform', `translate(0,${alto})`)
yAxis = g.append('g')

////INDICAMOS QUÉ TIPO DE EJES SON (UBICACIÓN)
xAxisCall = d3.axisBottom()
yAxisCall = d3.axisLeft()


////ASIGNACIÒN DE VALORES EN 'X' Y 'Y' PARA CADA LINEA A GRAFICAR
lineGenClose = d3.line()
                  .x(d => x(d.date))
                  .y(d => y(d.close))
lineGenSMA = d3.line()
                  .x(d => x(d.date))
                  .y(d => y(d.sma))

////CREAMOS EL "PATH" PARA CADA COLUMNA (CLOSE Y SMA)
lineaClose = g.append('path')
lineaSMA = g.append('path')

////VARIABLES
//indicadorTecnico = 'Ninguno'
actividadSMA = true

////INTERACTIVIDAD
botonSMA = d3.select('#printSMA');

////PARSES
parseTime = d3.timeParse(d3.timeParse('%d.%m.%Y'))

/////SE DEFINE FUNCIÓN "LOAD" PARA CARGA DE DATOS
function load(symbol='meli') {
          d3.csv(`${symbol}.csv`).then(data => {
            data.forEach(d => {
              d.close = +d.close
              d.sma = +d.sma
              d.date = parseTime(d.date)
        
            })
            
            ////INDICAMOS LOS VALORES MIN Y MAX DEL GRÁFICO PARA EL EJE X
            x.domain(d3.extent(data, d => d.date))

            ////INDICAMOS LOS VALORES MIN Y MAX DEL GRÁFICO PARA EL EJE Y
            ////TANTO PARA EL VALOR DE 'CLOSE' COMO PARA 'SMA'
            y.domain([d3.min(data, d => d.close) * 0.95, d3.max(data, function(d) {
              return Math.max(d.close, d.sma) * 1.05; })]);
            

            // Ejes
            xAxis.transition()
                  .duration(500)
                  .call(xAxisCall.scale(x))
            yAxis.transition()
                  .duration(500)
                  .call(yAxisCall.scale(y))

            console.log(data)
            data = data.reverse()
            this.data = data
            render(data, symbol)
          })
        }

////SE DEFINE LA FUNCIÓN "RENDER", PARA DIBUJAR LAS LÍNEAS
function render(data, symbol) {
  lineaClose.attr('fill', 'none')
              .attr('stroke', color(symbol) )
              .attr('stroke-width', 1.5)
              .transition()
              .duration(500)
              .attr('d', lineGenClose(data))

  if (actividadSMA) {
    lineaSMA.attr('fill', 'none')
            .attr('stroke', '#20b038')
            .attr('stroke-width', 0.5)
            .transition()
            .duration(500)
            .attr('d', lineGenSMA(data))
    } else {
      lineaSMA.attr('fill', 'none')
              .attr('stroke', 'none')
              .attr('stroke-width', 0.5)
              .transition()
              .duration(500)
              .attr('d', lineGenSMA(data))
    }
}

////SE LLAMA A LA FUNCIÓN "LOAD" PARA CARGAR LOS DATOS
load()

////
function cambio() {
  load(d3.select('#stock').node().value)
}

botonSMA.on('click', () => {
  actividadSMA = !actividadSMA
  if (actividadSMA) {
    botonSMA
      .classed('btn-success', true)
      .classed('btn-outline-success', false)
      
      cambio()
  } else {
    botonSMA
      .classed('btn-success', false)
      .classed('btn-outline-success', true)
      
      cambio()
  }
})

function mousemove(e) {

  x0 = x.invert(d3.pointer(e)[0])

  bisectDate = d3.bisector((d) => d.date).left
  i = bisectDate(data, x0, 1)
  console.log(`${x0} = ${i}`)

  d0 = data[i - 1]
  d1 = data[i]
  d = (x0 - d0.date) > (d1.date - x0) ? d1 : d0;

  focus.attr("transform", "translate(" + x(d.date) + "," + y(d.close) + ")");
  focus.select("text").text(function() { return d.close; }).attr('x',(-x(d.date)+100)).attr('y', (-y(d.close)+25)).attr('font-family', 'monospace');
  focus.select(".x-hover-line").attr("x2", - x(d.date))
  focus.select(".y-hover-line").attr("y2", alto - y(d.close))
}

function showleyenda(e, d, mostrar) {

  d3.select('#leyenda').moveToFront()

  if (mostrar) {
    d3.select('#leyenda').attr('display', null)
    d3.select('#fecha').text(d.date)
    d3.select('#cierre').text(d.close)
    d3.select('#leyenda')
      .attr('x', 10)
      .attr('y', 10)
  } else {
    d3.select('#leyenda').attr('display', 'none')
  }
}