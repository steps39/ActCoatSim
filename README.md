A work in progress inspired by and using the cellauto.js library - http://sanojian.github.io/cellauto/ a very clever small Javascript library.

The current simulation works by first using cellular automata to generate the polymer with the filler within it, then uses cellular automata to rapidly count the number of filler cells to calculate the PVC and then the leaching is carried out using cellular automata to mimick the dissolution of the inhibitor and the trasnport of leached inhibitor.

On loading this page the simulation will start, the graph displays the fraction of the coating which has been leached (diffused to top of the box), the legend below the plot shows the inhibitor PVC, the fraction of the inhibitor PVC which could be leached (i.e. not surrounded by polymer with no water access).  So the maximum cumulative fraction of the coating which will leach is the PVC multiplied by the accessible fraction.

A number of parameters of the simulation can be varied.  The inhibitor density and the inhibitor solubility (both in arbitary integer units), this will control the speed of leaching as for a cell of inhibitor with an inhibitor density of 9 and an inhibitor solubility of 1, it will take 9 dissolution events for it to disolve, where if the inhibitor density was 1 then it would only require 1 dissolution event.  The diffusion probability and solubility probability, determine how likely diffusion or dissolution is to occur in a single step, 1 means every time, another way to slow down the various steps.  The terminal fraction determines when a new structure will be generated, so 0.3 means 30% of the accessible fraction will be leached before a new structure is generated.

The coating is able to be pure primer, primer with a scribe or primer and topcoat with scribe, all of these with / without topcoat.  A primer and topcoat without a scribe will not do anything, as at present the topcoat is impermeable.

The simulation provides a very effective insight into how small differeneces in particle connectivity will give rise to large differences in leaching performance.

Getting started:

When the page first loads you will be shown a cross-section of a primer, brown coating with purplish inhibitor within it, in order to start leaching the "Top Water" check box is checked introducing water, which will leach the inhibitor from the coating.  If you click the "Regnerate" button, this will create a new coating with a different cross-section of primer.  The new primer's leaching graph will added to the previous plot.

Button use:

Pause / Play - will stop and start the current simulation.

Regenerate - will generate a new filled polymer and start a new simulation using the currently displayed parameter values, but will continue to plot on the same graph.

Full reset - will discard all previous results, generate a new filled polymer and start a new simulation using the currently displayed parameter value, creating a new graph.

Paramters:

Inhibitor density and Inhibitor solubility are described above.

Number of frames is the number of time steps which need to occur before the simulation is updated.

Number of plot is the number of time steps which need to occur before the graph is updated.

The plot autoscales with the latest result of the current run always in the top right making it easy to follow the current simulation.  Checking Global will fix the scale with the maximum of all the runs, so all data will be visible.

