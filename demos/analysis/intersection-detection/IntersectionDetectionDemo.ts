/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
import {
  DefaultEdgePathCropper,
  DefaultLabelStyle,
  Fill,
  FreeEdgeLabelModel,
  FreeNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphSnapContext,
  HorizontalTextAlignment,
  ICanvasObjectDescriptor,
  ICommand,
  IEdge,
  IGraph,
  INode,
  Insets,
  Intersection,
  IntersectionItemTypes,
  Intersections,
  LabelPositionHandler,
  LabelSnapContext,
  License,
  OrientedRectangle,
  OrthogonalEdgeEditingContext,
  Point,
  ShapeNodeStyle,
  VerticalTextAlignment,
  Visualization
} from 'yfiles'
import { bindAction, bindChangeListener, bindCommand, showApp } from '../../resources/demo-app'
import { IntersectionVisualCreator } from './DemoVisuals'
import { applyDemoTheme, colorSets, initDemoStyles } from '../../resources/demo-styles'
import GraphData from './resources/GraphData'
import { fetchLicense } from '../../resources/fetch-license'

/**
 * The graph component
 */
let graphComponent: GraphComponent

/**
 * The canvas object for the intersection visual.
 */
let intersectionVisualCreator: IntersectionVisualCreator

const considerSourceTargetIntersectionsBox = document.getElementById(
  'consider-source-target-node-intersections'
) as HTMLInputElement
const considerGroupContentIntersectionsBox = document.getElementById(
  'consider-group-content-intersections'
) as HTMLInputElement
const considerLabelOwnerIntersectionsBox = document.getElementById(
  'consider-label-owner-intersections'
) as HTMLInputElement
const considerItemGeometryBox = document.getElementById(
  'consider-item-geometry'
) as HTMLInputElement
const intersectionCountLabel = document.getElementById('intersection-count') as HTMLLabelElement
const nodeNodeCountLabel = document.getElementById('node-node-count') as HTMLLabelElement
const nodeEdgeCountLabel = document.getElementById('node-edge-count') as HTMLLabelElement
const edgeEdgeCountLabel = document.getElementById('edge-edge-count') as HTMLLabelElement
const labelCountLabel = document.getElementById('label-count') as HTMLLabelElement
const consideredItemsSelect = document.getElementById(
  'considered-items-select'
) as HTMLSelectElement

/**
 * This demo shows how to find and highlight intersections and overlaps between graph elements.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  // initialize the input mode
  initializeInputMode()

  // initialize the graph and the defaults
  initializeGraph(graphComponent.graph)

  // bind the buttons to their commands
  registerCommands()

  // load a sample graph
  loadSampleGraph(graphComponent.graph)
  graphComponent.fitGraphBounds()

  initializeIntersectionVisual()

  // finally, run the intersection algorithm on it
  runIntersectionAlgorithm()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Applies the intersection algorithm.
 */
function runIntersectionAlgorithm(): void {
  // configure the algorithm that computes intersections
  const intersections = new Intersections()

  // define which items are generally considered
  switch (consideredItemsSelect.value) {
    default:
    case 'all':
      intersections.consideredItemTypes = IntersectionItemTypes.ALL
      break
    case 'nodes':
      intersections.consideredItemTypes = IntersectionItemTypes.NODE
      break
    case 'edges':
      intersections.consideredItemTypes = IntersectionItemTypes.EDGE
      break
    case 'labels':
      intersections.consideredItemTypes = IntersectionItemTypes.LABEL
      break
    case 'nodes-and-edges':
      intersections.consideredItemTypes = IntersectionItemTypes.NODE | IntersectionItemTypes.EDGE
      break
    case 'nodes-and-labels':
      intersections.consideredItemTypes = IntersectionItemTypes.NODE | IntersectionItemTypes.LABEL
      break
  }

  // define which item types are considered to be independent of their owner
  let independentItems = GraphItemTypes.NONE
  if (considerLabelOwnerIntersectionsBox.checked) {
    // labels should be independent, e.g., a label intersection with its owning node is found
    independentItems |= GraphItemTypes.LABEL
  }
  if (considerSourceTargetIntersectionsBox.checked) {
    // edges should be independent, e.g., the intersection with the edges source node is found too, including the port
    independentItems |= GraphItemTypes.EDGE
  }
  if (considerGroupContentIntersectionsBox.checked) {
    // nodes should be independent, so that an intersection with an enclosing group node is included
    independentItems |= GraphItemTypes.NODE
  }
  intersections.independentItems = independentItems

  // whether to consider the shape geometry of the items
  intersections.considerItemGeometry = considerItemGeometryBox.checked

  // run the algorithm and obtain the result
  const intersectionsResult = intersections.run(graphComponent.graph)

  // store information of results in right side panel
  const intersectionInfoArray = intersectionsResult.intersections.toArray()
  updateIntersectionInfoPanel(intersectionInfoArray)

  updateIntersectionVisual(intersectionInfoArray)
}

/**
 * Updates the labels in the information panel with the number of intersections by type.
 */
function updateIntersectionInfoPanel(intersections: Intersection[]): void {
  let nodeNodeIntersections = 0
  let nodeEdgeIntersections = 0
  let edgeEdgeIntersections = 0
  let labelIntersections = 0
  for (const intersection of intersections) {
    const item1 = intersection.item1
    const item2 = intersection.item2
    if (item1 instanceof INode && item2 instanceof INode) {
      nodeNodeIntersections++
    } else if (item1 instanceof IEdge && item2 instanceof IEdge) {
      edgeEdgeIntersections++
    } else if (
      (item1 instanceof IEdge && item2 instanceof INode) ||
      (item1 instanceof INode && item2 instanceof IEdge)
    ) {
      nodeEdgeIntersections++
    } else {
      labelIntersections++
    }
  }

  intersectionCountLabel.innerText = `${intersections.length}`
  nodeNodeCountLabel.innerText = `${nodeNodeIntersections}`
  nodeEdgeCountLabel.innerText = `${nodeEdgeIntersections}`
  edgeEdgeCountLabel.innerText = `${edgeEdgeIntersections}`
  labelCountLabel.innerText = `${labelIntersections}`
}

/**
 * Updates the intersection visualization to show the given intersections.
 */
function updateIntersectionVisual(intersections: Intersection[]): void {
  intersectionVisualCreator.intersections = intersections
  graphComponent.invalidate()
}

/**
 * Creates the visualization for intersections calculated in this demo.
 */
function initializeIntersectionVisual(): void {
  intersectionVisualCreator = new IntersectionVisualCreator()
  graphComponent.highlightGroup
    .addChild(intersectionVisualCreator, ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE)
    .toFront()
}

/**
 * Loads the sample graph.
 */
function loadSampleGraph(graph: IGraph): void {
  const builder = new GraphBuilder(graph)
  const ns = builder.createNodesSource({
    data: GraphData.nodeList.filter(data => !data.isGroup),
    id: 'id',
    layout: 'layout',
    parentId: dataItem => dataItem.parent
  })
  ns.nodeCreator.addNodeCreatedListener((sender, evt) => {
    if (evt.dataItem.isEllipse) {
      const defaultStyle = graph.nodeDefaults.style as ShapeNodeStyle
      graph.setStyle(
        evt.item,
        new ShapeNodeStyle({
          shape: 'ellipse',
          fill: defaultStyle.fill,
          stroke: defaultStyle.stroke
        })
      )
    }
  })
  const nodeLabelCreator = ns.nodeCreator.createLabelsSource(data => data.labels || []).labelCreator
  nodeLabelCreator.textProvider = data => data.text || ''
  nodeLabelCreator.addLabelAddedListener((sender, evt) => {
    const label = evt.item
    const data = evt.dataItem
    graph.setLabelLayoutParameter(
      label,
      FreeNodeLabelModel.INSTANCE.findBestParameter(
        label,
        FreeNodeLabelModel.INSTANCE,
        new OrientedRectangle(data.anchorX, data.anchorY, data.width, data.height)
      )
    )
  })

  const groupSource = builder.createGroupNodesSource({
    data: GraphData.nodeList.filter(data => data.isGroup),
    id: 'id',
    layout: 'layout'
  })
  const groupLabelCreator = groupSource.nodeCreator.createLabelsSource(
    data => data.labels
  ).labelCreator
  groupLabelCreator.textProvider = data => data.text || ''

  const es = builder.createEdgesSource({
    data: GraphData.edgeList,
    id: 'id',
    sourceId: 'source',
    targetId: 'target',
    bends: 'bends'
  })
  const edgeLabelCreator = es.edgeCreator.createLabelsSource(data => data.labels || []).labelCreator
  edgeLabelCreator.textProvider = data => data.text || ''
  edgeLabelCreator.addLabelAddedListener((sender, evt) => {
    const label = evt.item
    const data = evt.dataItem
    graph.setLabelLayoutParameter(
      label,
      FreeEdgeLabelModel.INSTANCE.findBestParameter(
        label,
        FreeEdgeLabelModel.INSTANCE,
        new OrientedRectangle(data.anchorX, data.anchorY, data.width, data.height)
      )
    )
  })

  builder.buildGraph()

  graph.edges.forEach(edge => {
    if (edge.tag.sourcePort) {
      graph.setPortLocation(edge.sourcePort!, Point.from(edge.tag.sourcePort))
    }
    if (edge.tag.targetPort) {
      graph.setPortLocation(edge.targetPort!, Point.from(edge.tag.targetPort))
    }
  })
}

/**
 * Initializes default styles for the given graph.
 */
function initializeGraph(graph: IGraph): void {
  // set style defaults
  const theme = 'demo-palette-75'
  initDemoStyles(graph, { theme })
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'rectangle',
    fill: colorSets[theme].fill,
    stroke: `1px ${colorSets[theme].stroke}`
  })

  const nodeLabelStyle = new DefaultLabelStyle()
  nodeLabelStyle.backgroundFill = Fill.from(colorSets[theme].nodeLabelFill)
  nodeLabelStyle.textFill = Fill.from(colorSets[theme].text)
  nodeLabelStyle.verticalTextAlignment = VerticalTextAlignment.CENTER
  nodeLabelStyle.horizontalTextAlignment = HorizontalTextAlignment.CENTER
  nodeLabelStyle.insets = new Insets(4, 2, 4, 1)
  graph.nodeDefaults.labels.style = nodeLabelStyle
  graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.INSTANCE.createDefaultParameter()

  const edgeLabelStyle = new DefaultLabelStyle()
  edgeLabelStyle.backgroundFill = Fill.from(colorSets[theme].edgeLabelFill)
  edgeLabelStyle.textFill = Fill.from(colorSets[theme].text)
  edgeLabelStyle.verticalTextAlignment = VerticalTextAlignment.CENTER
  edgeLabelStyle.horizontalTextAlignment = HorizontalTextAlignment.CENTER
  edgeLabelStyle.insets = new Insets(4, 2, 4, 1)
  graph.edgeDefaults.labels.style = edgeLabelStyle
  graph.edgeDefaults.labels.layoutParameter = FreeEdgeLabelModel.INSTANCE.createDefaultParameter()

  graph.decorator.portDecorator.edgePathCropperDecorator.setImplementation(
    new DefaultEdgePathCropper({ cropAtPort: false, extraCropLength: 0 })
  )
  graph.decorator.labelDecorator.positionHandlerDecorator.setFactory(label => {
    const positionHandler = new LabelPositionHandler(label)
    positionHandler.visualization = Visualization.LIVE
    return positionHandler
  })
}

/**
 * Initializes the supported user interactions for this demo.
 */
function initializeInputMode(): void {
  // configure interaction
  const inputMode = new GraphEditorInputMode({
    allowCreateBend: true,
    selectableItems: 'all',
    allowGroupingOperations: true,
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext(),
    snapContext: new GraphSnapContext(),
    labelSnapContext: new LabelSnapContext()
  })

  // register listeners so that the intersections are re-calculated when changing the graph
  inputMode.addDeletedSelectionListener(runIntersectionAlgorithm)
  inputMode.createEdgeInputMode.addEdgeCreatedListener(runIntersectionAlgorithm)
  inputMode.addNodeCreatedListener(runIntersectionAlgorithm)
  inputMode.addLabelTextChangedListener(runIntersectionAlgorithm)
  inputMode.moveInputMode.addDraggedListener(runIntersectionAlgorithm)
  inputMode.handleInputMode.addDraggedListener(runIntersectionAlgorithm)
  inputMode.moveLabelInputMode.addDraggedListener(runIntersectionAlgorithm)

  graphComponent.inputMode = inputMode
}

/**
 * Wires the GUI elements with the corresponding commands.
 */
function registerCommands(): void {
  bindAction("button[data-command='New']", () => {
    graphComponent.graph.clear()
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  })

  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)

  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent, null)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent, null)

  bindChangeListener(
    "input[data-command='ConsiderSourceTargetNodeIntersections']",
    runIntersectionAlgorithm
  )
  bindChangeListener(
    "input[data-command='ConsiderGroupContentIntersections']",
    runIntersectionAlgorithm
  )
  bindChangeListener(
    "input[data-command='ConsiderLabelOwnerIntersections']",
    runIntersectionAlgorithm
  )
  bindChangeListener("input[data-command='ConsiderItemGeometry']", runIntersectionAlgorithm)
  consideredItemsSelect.addEventListener('change', runIntersectionAlgorithm)

  bindAction('#snapping-button', () => {
    const snappingEnabled = (document.querySelector('#snapping-button') as HTMLInputElement).checked
    const geim = graphComponent.inputMode as GraphEditorInputMode
    geim.snapContext!.enabled = snappingEnabled
    geim.labelSnapContext!.enabled = snappingEnabled
  })
}

// noinspection JSIgnoredPromiseFromCall
run()
