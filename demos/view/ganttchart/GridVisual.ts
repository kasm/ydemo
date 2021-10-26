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
/* global moment */
import {
  BaseClass,
  CanvasComponent,
  HtmlCanvasVisual,
  IRenderContext,
  IVisualCreator,
  Visual
} from 'yfiles'
import type { Task } from './GanttMapper'
import GanttMapper from './GanttMapper'
// import moment typings
import moment, { MomentInput } from 'moment'

/**
 * Manages and renders the background of the main component.
 */
export default class GridVisual extends BaseClass<HtmlCanvasVisual, IVisualCreator>(
  HtmlCanvasVisual,
  IVisualCreator
) {
  /**
   * Creates a new instance.
   * @param mapper The mapper.
   * @param dataModel The model data to create the grid for.
   */
  constructor(private readonly mapper: GanttMapper, private readonly dataModel: any) {
    super()
  }

  /**
   * Paints the grid visualization.
   * @param renderContext The render context of the {@link CanvasComponent}
   * @param canvasContext The HTML5 Canvas context to use for rendering.
   */
  paint(renderContext: IRenderContext, canvasContext: CanvasRenderingContext2D): void {
    const mapper = this.mapper

    const component = renderContext.canvasComponent!
    const { x, width } = component.viewport

    // get start date
    const beginDate = mapper.getDate(x - 100).startOf('month')
    const beginX = mapper.getX(beginDate)

    const endDate = mapper.getDate(x + width + 100).endOf('month')
    const endX = mapper.getX(endDate)

    this.drawDays(component, canvasContext, beginX, endX, beginDate)
    this.drawMonths(component, canvasContext, beginX, endX, beginDate)
    this.drawTaskSeparators(component, canvasContext, beginX, endX)
  }

  /**
   * Draws the day separators.
   */
  private drawDays(
    canvasComponent: CanvasComponent,
    canvasContext: CanvasRenderingContext2D,
    beginX: number,
    endX: number,
    beginDate: MomentInput
  ): void {
    const date = moment(beginDate)

    let x = beginX
    canvasContext.strokeStyle = '#ccc'
    canvasContext.lineWidth = 1
    const y1 = canvasComponent.viewport.y
    const y2 = canvasComponent.viewport.bottomLeft.y
    canvasContext.beginPath()
    while (x < endX) {
      canvasContext.moveTo(x, y1)
      canvasContext.lineTo(x, y2)
      x += GanttMapper.dayWidth
      date.add(1, 'days')
    }
    canvasContext.stroke()
  }

  /**
   * Draws the day separators.
   */
  private drawMonths(
    canvasComponent: CanvasComponent,
    canvasContext: CanvasRenderingContext2D,
    beginX: number,
    endX: number,
    beginDate: MomentInput
  ): void {
    const date = moment(beginDate)

    let x = beginX
    canvasContext.strokeStyle = '#ccc'
    canvasContext.lineWidth = 3
    const y1 = canvasComponent.viewport.y
    const y2 = canvasComponent.viewport.bottomLeft.y
    canvasContext.beginPath()
    while (x < endX) {
      canvasContext.moveTo(x, y1)
      canvasContext.lineTo(x, y2)
      const monthDays = date.daysInMonth()
      x += GanttMapper.dayWidth * monthDays
      date.add(1, 'months')
    }
    canvasContext.stroke()
  }

  /**
   * Draws the horizontal task lane separators.
   */
  private drawTaskSeparators(
    canvasComponent: CanvasComponent,
    canvasContext: CanvasRenderingContext2D,
    beginX: number,
    endX: number
  ): void {
    const x1 = beginX
    const x2 = endX

    canvasContext.save()
    canvasContext.strokeStyle = '#ccc'
    canvasContext.lineWidth = 1
    try {
      canvasContext.setLineDash([5, 5])
    } catch (e) {
      // Unsupported in IE9 and IE10. Just use solid line then
    }

    canvasContext.beginPath()
    this.dataModel.tasks.forEach((task: Task) => {
      const y =
        this.mapper.getTaskY(task) +
        this.mapper.getCompleteTaskHeight(task) +
        GanttMapper.taskSpacing * 0.5
      canvasContext.moveTo(x1, y)
      canvasContext.lineTo(x2, y)
    })
    canvasContext.stroke()
    canvasContext.restore()
  }

  /**
   * Returns this instance.
   */
  createVisual(context: IRenderContext): Visual {
    return this
  }

  /**
   * Returns this instance.
   */
  updateVisual(context: IRenderContext, oldVisual: Visual): Visual {
    return oldVisual
  }
}
