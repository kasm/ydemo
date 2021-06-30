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
import { GraphEditorInputMode, IEdge, IModelItem, INode } from 'yfiles'
import { isCrossReference, isRoot } from './MindmapUtil'

/**
 * This class disables interactions on certain items.
 */
export default class MindmapEditorInputMode extends GraphEditorInputMode {
  /**
   * Enables selection only for cross reference edges.
   * @param item The item to check.
   * @see Overrides {@link GraphEditorInputMode#shouldClickSelect}
   */
  shouldClickSelect(item: IModelItem): boolean {
    if (IEdge.isInstance(item)) {
      return isCrossReference(item)
    }
    return super.shouldClickSelect(item)
  }

  /**
   * Disables moving root node.
   * @param item The item to check.
   * @see Overrides {@link GraphEditorInputMode#shouldMove}
   */
  shouldMove(item: IModelItem): boolean {
    if (INode.isInstance(item)) {
      return !isRoot(item)
    }
    return super.shouldMove(item)
  }
}