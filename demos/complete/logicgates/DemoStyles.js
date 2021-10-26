/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Font,
  FontWeight,
  GeneralPath,
  INode,
  INodeStyle,
  IRenderContext,
  NodeStyleBase,
  Point,
  Size,
  SvgVisual,
  TextRenderSupport,
  Visual
} from 'yfiles'

import { LogicGateType } from './LogicGatesHelper.js'

export class GateNodeStyle extends NodeStyleBase {
  /** 
    color for input pins
  * @type {'#E01A4F'}
   */
  static get IN_COLOR() {
    if (typeof GateNodeStyle.$IN_COLOR === 'undefined') {
      GateNodeStyle.$IN_COLOR = '#E01A4F'
    }

    return GateNodeStyle.$IN_COLOR
  }

  /** 
    color for input pins
  * @type {'#E01A4F'}
   */
  static set IN_COLOR(IN_COLOR) {
    GateNodeStyle.$IN_COLOR = IN_COLOR
  }

  /** 
    color for output pins
  * @type {'#01BAFF'}
   */
  static get OUT_COLOR() {
    if (typeof GateNodeStyle.$OUT_COLOR === 'undefined') {
      GateNodeStyle.$OUT_COLOR = '#01BAFF'
    }

    return GateNodeStyle.$OUT_COLOR
  }

  /** 
    color for output pins
  * @type {'#01BAFF'}
   */
  static set OUT_COLOR(OUT_COLOR) {
    GateNodeStyle.$OUT_COLOR = OUT_COLOR
  }

  /**
   * @param {!LogicGateType} gateType
   */
  constructor(gateType) {
    super()
    this.gateType = gateType
  }
}

/**
 * An implementation of an {@link INodeStyle} that uses the convenience class
 * {@link NodeStyleBase} as the base class.
 */
export class AndGateNodeStyle extends GateNodeStyle {
  /**
   * Creates a new instance of AndGateNodeStyle
   * @param {boolean} negated
   */
  constructor(negated) {
    super(negated ? LogicGateType.NAND : LogicGateType.AND)

    // colors for normal version of gate
    this.fillColor = '#363020'

    this.strokeColor = '#201F1A'
    this.labelColor = '#FFFFFF'

    // colors for inverted version of gate
    this.negatedFillColor = '#605C4E'

    this.negatedStrokeColor = '#3A3834'
  }

  /**
   * Creates the visual for a node.
   * @param {!IRenderContext} context The render context.
   * @param {!INode} node The node to which this style instance is assigned.
   * @see Overrides {@link NodeStyleBase#createVisual}
   * @returns {!SvgVisual}
   */
  createVisual(context, node) {
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    // Cache the necessary data for rendering of the node
    const cache = createRenderDataCache(node)
    // Render the node
    this.render(g, cache, node)
    // set the location
    SvgVisual.setTranslate(g, node.layout.x, node.layout.y)
    return new SvgVisual(g)
  }

  /**
   * Re-renders the node using the old visual for performance reasons.
   * @param {!IRenderContext} context The render context
   * @param {!Visual} oldVisual The old visual
   * @param {!INode} node The node to which this style instance is assigned
   * @see Overrides {@link NodeStyleBase#updateVisual}
   * @returns {!Visual}
   */
  updateVisual(context, oldVisual, node) {
    if (!(oldVisual instanceof SvgVisual)) {
      return this.createVisual(context, node)
    }
    const container = oldVisual.svgElement
    // get the data with which the oldvisual was created
    const oldCache = container['data-renderDataCache']
    // get the data for the new visual
    const newCache = createRenderDataCache(node)

    // check if something changed except for the location of the node
    if (!newCache.equals(newCache, oldCache)) {
      // something changed - re-render the visual
      while (container.hasChildNodes()) {
        // remove all children
        container.removeChild(container.firstChild)
      }
      this.render(container, newCache, node)
    }
    // make sure that the location is up to date
    SvgVisual.setTranslate(container, node.layout.x, node.layout.y)
    return oldVisual
  }

  /**
   * Creates the Svg elements and adds them to the container.
   * @param {!Element} container The svg element
   * @param {!RenderDataCache} cache The render-data cache object
   * @param {!INode} node The given node
   */
  render(container, cache, node) {
    // store information with the visual on how we created it
    container['data-renderDataCache'] = cache

    // the size of node
    const size = cache.size
    const width = size.width
    const height = size.height

    const isNegated = this.gateType === LogicGateType.NAND

    const x1 = width * 0.15
    const x2 = width * 0.6
    const y1 = height * 0.25
    const y2 = height * 0.5
    const y3 = height * 0.75

    // create main part
    const generalPath = new GeneralPath()
    generalPath.moveTo(new Point(x1, 0))
    generalPath.lineTo(new Point(x2, 0))

    const firstPoint = new Point(x2, 0)
    const endPoint = new Point(x2, height)
    const c1 = new Point(firstPoint.x + width * 0.3, firstPoint.y + height * 0.1)
    const c2 = new Point(endPoint.x + width * 0.3, endPoint.y - height * 0.1)
    generalPath.cubicTo(c1, c2, endPoint)

    const extremaX = getPointOnCurve(0.5, firstPoint, endPoint, c1, c2)
    generalPath.lineTo(new Point(x1, height))
    generalPath.close()
    createPath(
      container,
      generalPath,
      isNegated ? this.negatedFillColor : this.fillColor,
      isNegated ? this.negatedStrokeColor : this.strokeColor
    )

    // create output port
    const outputPortPath = new GeneralPath()
    outputPortPath.moveTo(new Point(isNegated ? extremaX + 2 * width * 0.03 : extremaX, y2))
    outputPortPath.lineTo(new Point(width, y2))
    const outputStroke = node.tag && node.tag.targetHighlight ? AndGateNodeStyle.OUT_COLOR : 'black'
    createPath(container, outputPortPath, 'none', outputStroke)

    // create input port
    const inputPortPath = new GeneralPath()
    inputPortPath.moveTo(new Point(0, y1))
    inputPortPath.lineTo(new Point(x1, y1))
    inputPortPath.moveTo(new Point(x1, y3))
    inputPortPath.lineTo(new Point(0, y3))
    const inputStroke = node.tag && node.tag.sourceHighlight ? AndGateNodeStyle.IN_COLOR : 'black'
    createPath(container, inputPortPath, 'none', inputStroke)

    if (isNegated) {
      appendEllipse(container, extremaX + width * 0.03, height * 0.5, width * 0.03, width * 0.03)
    }

    const fontSize = Math.floor(node.layout.height * 0.25)
    const textContent = isNegated ? 'NAND' : 'AND'
    const text = createText(textContent, fontSize, this.labelColor)
    const textSize = TextRenderSupport.measureText(
      text.textContent || '',
      new Font({
        fontFamily: 'Arial',
        fontSize,
        fontWeight: FontWeight.BOLD
      })
    )
    setAttribute(text, 'x', (node.layout.width - textSize.width) * 0.45)
    setAttribute(text, 'y', (node.layout.height - textSize.height) * 0.8)

    container.appendChild(text)
  }
}

/**
 * An implementation of an {@link INodeStyle} that uses the convenience class
 * {@link NodeStyleBase} as the base class.
 */
export class NotNodeStyle extends GateNodeStyle {
  constructor() {
    super(LogicGateType.NOT)
    this.fillColor = '#EAFFDA'
    this.strokeColor = '#92998E'
    this.labelColor = '#000000'
  }

  /**
   * Creates the visual for a node.
   * @param {!IRenderContext} context The render context.
   * @param {!INode} node The node to which this style instance is assigned.
   * @see Overrides {@link NodeStyleBase#createVisual}
   * @returns {!SvgVisual}
   */
  createVisual(context, node) {
    // This implementation creates a 'g' element and uses it as a container for the rendering of the node.
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    // Cache the necessary data for rendering of the node
    const cache = createRenderDataCache(node)
    // Render the node
    this.render(g, cache, node)
    // set the location
    SvgVisual.setTranslate(g, node.layout.x, node.layout.y)
    return new SvgVisual(g)
  }

  /**
   * Re-renders the node using the old visual for performance reasons.
   * @param {!IRenderContext} context The render context
   * @param {!SvgVisual} oldVisual The old visual
   * @param {!INode} node The node to which this style instance is assigned
   * @see Overrides {@link NodeStyleBase#updateVisual}
   * @returns {!SvgVisual}
   */
  updateVisual(context, oldVisual, node) {
    const container = oldVisual.svgElement
    // get the data with which the oldvisual was created
    const oldCache = container['data-renderDataCache']
    // get the data for the new visual
    const newCache = createRenderDataCache(node)

    // check if something changed except for the location of the node
    if (!newCache.equals(newCache, oldCache)) {
      // something changed - re-render the visual
      while (container.hasChildNodes()) {
        // remove all children
        container.removeChild(container.firstChild)
      }
      this.render(container, newCache, node)
    }
    // make sure that the location is up to date
    SvgVisual.setTranslate(container, node.layout.x, node.layout.y)
    return oldVisual
  }

  /**
   * Creates the Svg elements and adds them to the container.
   * @param {!Element} container The svg element
   * @param {!RenderDataCache} cache The render-data cache object
   * @param {!INode} node The given node
   */
  render(container, cache, node) {
    // store information with the visual on how we created it
    container['data-renderDataCache'] = cache

    // the size of node
    const size = cache.size
    const width = size.width
    const height = size.height

    const x1 = width * 0.2
    const x2 = width * 0.7

    const generalPath = new GeneralPath()
    generalPath.moveTo(new Point(x1, 0))
    generalPath.lineTo(new Point(x2, height * 0.5))
    generalPath.lineTo(new Point(x1, height))
    generalPath.close()
    createPath(container, generalPath, this.fillColor, this.strokeColor)
    appendEllipse(container, x2 + width * 0.03, height * 0.5, width * 0.03, width * 0.03)

    // create input port
    const inputPortPath = new GeneralPath()
    inputPortPath.moveTo(new Point(0, height * 0.5))
    inputPortPath.lineTo(new Point(x1, height * 0.5))
    const inputStroke = node.tag && node.tag.sourceHighlight ? NotNodeStyle.IN_COLOR : 'black'
    createPath(container, inputPortPath, 'none', inputStroke)

    // create output port
    const outputPortPath = new GeneralPath()
    outputPortPath.moveTo(new Point(x2 + 2 * width * 0.03, height * 0.5))
    outputPortPath.lineTo(new Point(width, height * 0.5))
    const outputStroke = node.tag && node.tag.targetHighlight ? NotNodeStyle.OUT_COLOR : 'black'
    createPath(container, outputPortPath, 'none', outputStroke)

    const fontSize = Math.floor(node.layout.height * 0.25)
    const text = createText('NOT', fontSize, this.labelColor)
    const textSize = TextRenderSupport.measureText(
      text.textContent || '',
      new Font({
        fontFamily: 'Arial',
        fontSize,
        fontWeight: FontWeight.BOLD
      })
    )
    setAttribute(text, 'x', (node.layout.width - textSize.width) * 0.33)
    setAttribute(text, 'y', (node.layout.height - textSize.height) * 0.8)
    container.appendChild(text)
  }
}

/**
 * @param {!Element} element
 * @param {!string} name
 * @param {!(number|string)} value
 */
function setAttribute(element, name, value) {
  element.setAttribute(name, value.toString())
}

/**
 * An implementation of an {@link INodeStyle} that uses the convenience class
 * {@link NodeStyleBase} as the base class.
 */
export class OrNodeStyle extends GateNodeStyle {
  /**
   * Creates a new instance of OrNodeStyle.
   * @param {boolean} negated
   */
  constructor(negated) {
    super(negated ? LogicGateType.NOR : LogicGateType.OR)

    // colors for normal version of gate
    this.fillColor = '#A49966'

    this.strokeColor = '#625F50'
    this.labelColor = '#FFFFFF'

    //colors for inverted version of gate
    this.negatedFillColor = '#C7C7A6'

    this.negatedStrokeColor = '#77776E'
    this.negatedLabelColor = '#000000'
  }

  /**
   * Creates the visual for a node.
   * @param {!IRenderContext} context The render context.
   * @param {!INode} node The node to which this style instance is assigned.
   * @see Overrides {@link NodeStyleBase#createVisual}
   * @returns {!SvgVisual}
   */
  createVisual(context, node) {
    // This implementation creates a 'g' element and uses it as a container for the rendering of the node.
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    // Cache the necessary data for rendering of the node
    const cache = createRenderDataCache(node)
    // Render the node
    this.render(g, cache, node)
    // set the location
    SvgVisual.setTranslate(g, node.layout.x, node.layout.y)
    return new SvgVisual(g)
  }

  /**
   * Re-renders the node using the old visual for performance reasons.
   * @param {!IRenderContext} context The render context
   * @param {!Visual} oldVisual The old visual
   * @param {!INode} node The node to which this style instance is assigned
   * @see Overrides {@link NodeStyleBase#updateVisual}
   * @returns {!SvgVisual}
   */
  updateVisual(context, oldVisual, node) {
    if (!(oldVisual instanceof SvgVisual)) {
      return this.createVisual(context, node)
    }
    const container = oldVisual.svgElement
    // get the data with which the oldvisual was created
    const oldCache = container['data-renderDataCache']
    // get the data for the new visual
    const newCache = createRenderDataCache(node)

    // check if something changed except for the location of the node
    if (!newCache.equals(newCache, oldCache)) {
      // something changed - re-render the visual
      while (container.hasChildNodes()) {
        // remove all children
        container.removeChild(container.firstChild)
      }
      this.render(container, newCache, node)
    }
    // make sure that the location is up to date
    SvgVisual.setTranslate(container, node.layout.x, node.layout.y)
    return oldVisual
  }

  /**
   * Creates the Svg elements and adds them to the container.
   * @param {!Element} container The svg element
   * @param {!RenderDataCache} cache The render-data cache object
   * @param {!INode} node The given node
   */
  render(container, cache, node) {
    // store information with the visual on how we created it
    container['data-renderDataCache'] = cache

    // the size of node
    const size = cache.size
    const width = size.width
    const height = size.height

    // is inverted output
    const isNegated = this.gateType === LogicGateType.NOR

    const x1 = width * 0.15
    const x2 = width * 0.8
    const y1 = height * 0.25
    const y2 = height * 0.5
    const y3 = height * 0.75

    const generalPath = new GeneralPath()
    generalPath.moveTo(x1, 0)

    let firstPoint = new Point(x1, 0)
    let endPoint = new Point(x2, y2)
    let c1 = new Point(firstPoint.x + (endPoint.x - firstPoint.x) * 0.5, firstPoint.y)
    let c2 = new Point(endPoint.x - (endPoint.x - firstPoint.x) * 0.5, endPoint.y - height * 0.5)
    generalPath.cubicTo(c1, c2, endPoint)

    firstPoint = new Point(x2, y2)
    endPoint = new Point(x1, height)
    c1 = new Point(firstPoint.x + (endPoint.x - firstPoint.x) * 0.5, firstPoint.y + height * 0.5)
    c2 = new Point(endPoint.x - (endPoint.x - firstPoint.x) * 0.5, endPoint.y)
    generalPath.cubicTo(c1, c2, endPoint)

    firstPoint = new Point(x1, height)
    endPoint = new Point(x1, 0)
    c1 = new Point(firstPoint.x + width * 0.1, firstPoint.y - height * 0.1)
    c2 = new Point(endPoint.x + width * 0.1, endPoint.y + height * 0.1)
    generalPath.cubicTo(c1, c2, endPoint)
    generalPath.close()
    createPath(
      container,
      generalPath,
      isNegated ? this.negatedFillColor : this.fillColor,
      isNegated ? this.negatedStrokeColor : this.strokeColor
    )

    // create input port
    const inputPortPath = new GeneralPath()
    const x11 = getPointOnCurve(0.3, firstPoint, endPoint, c1, c2)
    const x21 = getPointOnCurve(0.7, firstPoint, endPoint, c1, c2)
    inputPortPath.moveTo(0, y1)
    inputPortPath.lineTo(x11, y1)
    inputPortPath.moveTo(0, y3)
    inputPortPath.lineTo(x21, y3)
    let stroke = node.tag && node.tag.sourceHighlight ? OrNodeStyle.IN_COLOR : 'black'
    createPath(container, inputPortPath, 'none', stroke)

    // create output port
    const outputPortPath = new GeneralPath()
    outputPortPath.moveTo(isNegated ? x2 + 2 * width * 0.03 : x2, y2)
    outputPortPath.lineTo(width, y2)
    stroke = node.tag && node.tag.targetHighlight ? OrNodeStyle.OUT_COLOR : 'black'
    createPath(container, outputPortPath, 'none', stroke)

    if (isNegated) {
      appendEllipse(container, x2 + width * 0.03, height * 0.5, width * 0.03, width * 0.03)
    }

    const fontSize = Math.floor(node.layout.height * 0.25)
    const textContent = isNegated ? 'NOR' : 'OR'
    const text = createText(
      textContent,
      fontSize,
      isNegated ? this.negatedLabelColor : this.labelColor
    )
    const textSize = TextRenderSupport.measureText(
      text.textContent || '',
      new Font({
        fontFamily: 'Arial',
        fontSize,
        fontWeight: FontWeight.BOLD
      })
    )
    setAttribute(text, 'x', (node.layout.width - textSize.width) * 0.4)
    setAttribute(text, 'y', (node.layout.height - textSize.height) * 0.8)
    container.appendChild(text)
  }
}

/**
 * An implementation of an {@link INodeStyle} that uses the convenience class
 * {@link NodeStyleBase} as the base class.
 */
export class XOrNodeStyle extends GateNodeStyle {
  /**
   * Creates a new instance of XOrNodeStyle.
   * @param {boolean} negated
   */
  constructor(negated) {
    super(negated ? LogicGateType.XNOR : LogicGateType.XOR)

    // colors for normal version of gate
    this.fillColor = '#A4778B'

    this.strokeColor = '#62555B'
    this.labelColor = '#FFFFFF'

    // colors for inverted version of gate
    this.negatedFillColor = '#AA4586'

    this.negatedStrokeColor = '#66485B'
  }

  /**
   * Creates the visual for a node.
   * @param {!IRenderContext} context The render context.
   * @param {!INode} node The node to which this style instance is assigned.
   * @see Overrides {@link NodeStyleBase#createVisual}
   * @returns {!SvgVisual}
   */
  createVisual(context, node) {
    // This implementation creates a 'g' element and uses it as a container for the rendering of the node.
    const g = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
    // Cache the necessary data for rendering of the node
    const cache = createRenderDataCache(node)
    // Render the node
    this.render(g, cache, node)
    // set the location
    SvgVisual.setTranslate(g, node.layout.x, node.layout.y)
    return new SvgVisual(g)
  }

  /**
   * Re-renders the node using the old visual for performance reasons.
   * @param {!IRenderContext} context The render context
   * @param {!Visual} oldVisual The old visual
   * @param {!INode} node The node to which this style instance is assigned
   * @see Overrides {@link NodeStyleBase#updateVisual}
   * @returns {!SvgVisual}
   */
  updateVisual(context, oldVisual, node) {
    if (!(oldVisual instanceof SvgVisual)) {
      return this.createVisual(context, node)
    }
    const container = oldVisual.svgElement
    // get the data with which the oldvisual was created
    const oldCache = container['data-renderDataCache']
    // get the data for the new visual
    const newCache = createRenderDataCache(node)

    // check if something changed except for the location of the node
    if (!newCache.equals(newCache, oldCache)) {
      // something changed - re-render the visual
      while (container.hasChildNodes()) {
        // remove all children
        container.removeChild(container.firstChild)
      }
      this.render(container, newCache, node)
    }
    // make sure that the location is up to date
    SvgVisual.setTranslate(container, node.layout.x, node.layout.y)
    return oldVisual
  }

  /**
   * Creates the Svg elements and adds them to the container.
   * @param {!Element} container The svg element
   * @param {!RenderDataCache} cache The render-data cache object
   * @param {!INode} node The given node
   */
  render(container, cache, node) {
    // store information with the visual on how we created it
    container['data-renderDataCache'] = cache

    // the size of node
    const size = cache.size
    const width = size.width
    const height = size.height

    const x1 = width * 0.18
    const x2 = width * 0.25
    const x3 = width * 0.8
    const y1 = height * 0.25
    const y2 = height * 0.5
    const y3 = height * 0.75
    const isNegated = this.gateType === LogicGateType.XNOR

    let generalPath = new GeneralPath()
    generalPath.moveTo(x2, 0)

    let firstPoint = new Point(x2, 0)
    let endPoint = new Point(x3, y2)
    let c1 = new Point(firstPoint.x + (endPoint.x - firstPoint.x) * 0.5, firstPoint.y)
    let c2 = new Point(endPoint.x - (endPoint.x - firstPoint.x) * 0.5, endPoint.y - height * 0.5)
    generalPath.cubicTo(c1, c2, endPoint)

    firstPoint = new Point(x3, y2)
    endPoint = new Point(x2, height)
    c1 = new Point(firstPoint.x + (endPoint.x - firstPoint.x) * 0.5, firstPoint.y + height * 0.5)
    c2 = new Point(endPoint.x - (endPoint.x - firstPoint.x) * 0.5, endPoint.y)
    generalPath.cubicTo(c1, c2, endPoint)

    firstPoint = new Point(x2, height)
    endPoint = new Point(x2, 0)
    c1 = new Point(firstPoint.x + width * 0.1, firstPoint.y - height * 0.1)
    c2 = new Point(endPoint.x + width * 0.1, endPoint.y + height * 0.1)

    generalPath.cubicTo(c1, c2, endPoint)
    generalPath.close()

    createPath(
      container,
      generalPath,
      isNegated ? this.negatedFillColor : this.fillColor,
      isNegated ? this.negatedStrokeColor : this.strokeColor
    )

    generalPath = new GeneralPath()
    generalPath.moveTo(x1, height)
    firstPoint = new Point(x1, height)
    endPoint = new Point(x1, 0)
    c1 = new Point(firstPoint.x + width * 0.1, firstPoint.y - height * 0.1)
    c2 = new Point(endPoint.x + width * 0.1, endPoint.y + height * 0.1)
    generalPath.cubicTo(c1, c2, endPoint)
    createPath(container, generalPath)

    // create input port
    const inputPortPath = new GeneralPath()
    const x11 = getPointOnCurve(0.3, firstPoint, endPoint, c1, c2)
    const x21 = getPointOnCurve(0.7, firstPoint, endPoint, c1, c2)
    inputPortPath.moveTo(0, y1)
    inputPortPath.lineTo(x11, y1)
    inputPortPath.moveTo(0, y3)
    inputPortPath.lineTo(x21, y3)
    const inputStroke = node.tag && node.tag.sourceHighlight ? XOrNodeStyle.IN_COLOR : 'black'
    createPath(container, inputPortPath, 'none', inputStroke)

    // create output port
    const outputPortPath = new GeneralPath()
    outputPortPath.moveTo(isNegated ? x3 + 2 * width * 0.03 : x3, y2)
    outputPortPath.lineTo(width, y2)
    const outputStroke = node.tag && node.tag.targetHighlight ? XOrNodeStyle.OUT_COLOR : 'black'
    createPath(container, outputPortPath, 'none', outputStroke)

    if (isNegated) {
      appendEllipse(container, x3 + width * 0.03, height * 0.5, width * 0.03, width * 0.03)
    }

    const fontSize = Math.floor(node.layout.height * 0.25)
    const textContent = isNegated ? 'XNOR' : 'XOR'
    const text = createText(textContent, fontSize, this.labelColor)
    const textSize = TextRenderSupport.measureText(
      text.textContent || '',
      new Font({
        fontFamily: 'Arial',
        fontSize,
        fontWeight: FontWeight.BOLD
      })
    )
    setAttribute(text, 'x', (node.layout.width - textSize.width) * 0.535)
    setAttribute(text, 'y', (node.layout.height - textSize.height) * 0.8)
    container.appendChild(text)
  }
}

/**
 * Calculates a point on the bezier cubic curve based on the given t value.
 * @param {number} t The parametric value t in [0,1]
 * @param {!Point} firstPoint The first point of the curve
 * @param {!Point} endPoint The end point of the curve
 * @param {!Point} c1 The first control point of the curve
 * @param {!Point} c2 The second control point of the curve
 * @returns {number} The calculated point the cubic bezier curve
 */
function getPointOnCurve(t, firstPoint, endPoint, c1, c2) {
  return (
    Math.pow(1 - t, 3) * firstPoint.x +
    3 * Math.pow(1 - t, 2) * t * c1.x +
    3 * (1 - t) * t * t * c2.x +
    t * t * t * endPoint.x
  )
}

/**
 * @typedef {Object} RenderDataCache
 * @property {Size} size
 * @property {boolean} sourceHighlight
 * @property {boolean} targetHighlight
 * @property {function} equals
 */

/**
 * Creates an object containing all necessary data to create a visual for the node.
 * @param {!INode} node The node to which this style instance is assigned.
 * @returns {!RenderDataCache} The render data cache object
 */
function createRenderDataCache(node) {
  return {
    size: node.layout.toSize(),
    sourceHighlight: node.tag && node.tag.sourceHighlight,
    targetHighlight: node.tag && node.tag.targetHighlight,
    equals: (self, other) =>
      self.size.equals(other.size) &&
      self.sourceHighlight === other.sourceHighlight &&
      self.targetHighlight === other.targetHighlight
  }
}

/**
 * Creates an svg ellipse and appends it to the given container element.
 * @param {!Element} container The svg element to append the ellipse to
 * @param {number} cx The x coordinate of the center of the ellipse
 * @param {number} cy The y coordinate of the center of the ellipse
 * @param {number} rx The horizontal radius
 * @param {number} ry The vertical radius
 */
function appendEllipse(container, cx, cy, rx, ry) {
  const ellipse = window.document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
  ellipse.cx.baseVal.value = cx
  ellipse.cy.baseVal.value = cy
  ellipse.rx.baseVal.value = rx
  ellipse.ry.baseVal.value = ry
  setAttribute(ellipse, 'fill', 'white')
  setAttribute(ellipse, 'stroke', 'black')
  setAttribute(ellipse, 'stroke-width', '2')
  container.appendChild(ellipse)
}

/**
 * Creates an svg path from the given general path and appends it to the given container element.
 * @param {!Element} container The svg element to append the path to
 * @param {!GeneralPath} generalPath The given general path
 * @param fill The fill for this path
 * @param stroke The stroke for this path
 * @param {!string} [fill]
 * @param {!string} [stroke]
 */
function createPath(container, generalPath, fill, stroke) {
  const path = generalPath.createSvgPath()
  setAttribute(path, 'stroke', stroke || 'black')
  setAttribute(path, 'stroke-width', '2')
  setAttribute(path, 'fill', fill || 'none')
  setAttribute(path, 'stroke-linejoin', 'round')
  container.appendChild(path)
}

/**
 * Creates an svg text element with the given content and font size.
 * @param {!string} textContent The text content
 * @param {number} fontSize The font size
 * @param {!string} color The text color
 * @returns {!Element} The created text element
 */
function createText(textContent, fontSize, color) {
  const text = window.document.createElementNS('http://www.w3.org/2000/svg', 'text')
  text.textContent = textContent
  setAttribute(text, 'font-family', 'Arial')
  setAttribute(text, 'fill', color)

  setAttribute(text, 'font-size', `${fontSize}px`)
  setAttribute(text, 'font-family', 'Arial')
  setAttribute(text, 'font-weight', 'bold')
  return text
}
