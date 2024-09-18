const diagramDivId = 'myDiagramDiv';
const paletteDivId = 'myPaletteDiv';

function init() {
    var $ = go.GraphObject.make; // shorthand for GoJS graph object creation

    // Initialize the Diagram
    myDiagram = $(go.Diagram, "myDiagramDiv",
        {
            initialContentAlignment: go.Spot.Center,
            "LinkDrawn": showLinkLabel,  // listener to show link labels
            "LinkRelinked": showLinkLabel,
            scrollsPageOnFocus: false,
            grid: $(go.Panel, "Grid",  // add a grid for snapping and alignment
                $(go.Shape, "LineH", { stroke: "lightgray", strokeWidth: 0.5 }),
                $(go.Shape, "LineH", { stroke: "gray", strokeWidth: 0.5, interval: 10 }),
                $(go.Shape, "LineV", { stroke: "lightgray", strokeWidth: 0.5 }),
                $(go.Shape, "LineV", { stroke: "gray", strokeWidth: 0.5, interval: 10 })
            ),
            allowDrop: true,  // enable drag and drop from the Palette
            "draggingTool.dragsLink": true,
            "draggingTool.isGridSnapEnabled": true,
            "linkingTool.isUnconnectedLinkValid": true,
            "linkingTool.portGravity": 20,
            "relinkingTool.isUnconnectedLinkValid": true,
            "relinkingTool.portGravity": 20,
            "relinkingTool.fromHandleArchetype": $(go.Shape, "Diamond", {
                segmentIndex: 0, cursor: "pointer", desiredSize: new go.Size(8, 8),
                fill: "tomato", stroke: "darkred"
            }),
            "relinkingTool.toHandleArchetype": $(go.Shape, "Diamond", {
                segmentIndex: -1, cursor: "pointer", desiredSize: new go.Size(8, 8),
                fill: "darkred", stroke: "tomato"
            }),
            "linkReshapingTool.handleArchetype": $(go.Shape, "Diamond", {
                desiredSize: new go.Size(7, 7),
                fill: "lightblue", stroke: "deepskyblue"
            }),
            "undoManager.isEnabled": true  // enable undo and redo
        }
    );

    // Update document title when the diagram is modified
    myDiagram.addDiagramListener("Modified", function (e) {
        var button = document.getElementById("SaveButton");
        if (button) button.disabled = !myDiagram.isModified;
        var idx = document.title.indexOf("*");
        document.title = myDiagram.isModified ? (idx < 0 ? document.title + "*" : document.title) : document.title.substr(0, idx);
    });

    // Define a reusable node style
    function nodeStyle() {
        return [
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            { locationSpot: go.Spot.Center }
        ];
    }

    // Create a port function that returns a configurable port
    function makePort(name, align, spot, output, input) {
        return $(go.Shape, 'Circle',
            {
                fill: "transparent",  // transparent until hovered over
                strokeWidth: 0,  // no border
                width: 10,  // width for side ports
                height: 10,  // height for top/bottom ports
                alignment: align,  // alignment on the node
                stretch: go.GraphObject.Vertical,
                portId: name,  // name of the port
                fromSpot: spot,  // where links can connect
                fromLinkable: output,  // whether links can be drawn from this port
                toSpot: spot,  // where links can connect
                toLinkable: input,  // whether links can be connected here
                cursor: "pointer",  // cursor change to indicate a valid port
                mouseEnter: (e, port) => { if (!e.diagram.isReadOnly) port.fill = "rgba(255,0,255,0.5)"; },
                mouseLeave: (e, port) => { port.fill = "transparent"; }
            }
        );
    }

    function textStyle() {
        return { font: "bold 11pt Helvetica, Arial, sans-serif", stroke: "whitesmoke" };
    }

    // Define default node template
    myDiagram.nodeTemplateMap.add("",
        $(go.Node, "Table", nodeStyle(),
            $(go.Panel, "Auto",
                $(go.Shape, "Rectangle", { fill: "#00A9C9", strokeWidth: 0 }),
                $(go.TextBlock, textStyle(),
                    { margin: 8, maxSize: new go.Size(160, NaN), wrap: go.TextBlock.WrapFit, editable: true },
                    new go.Binding("text").makeTwoWay()
                )
            ),
            makePort("T", go.Spot.Top, go.Spot.TopSide, false, true),
            makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
            makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
            makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
        )
    );

    // Add custom nodes (step, io, condition, etc.) similar to above

    // Add custom nodes (step, io, condition, etc.) similar to above



    myDiagram.nodeTemplateMap.add("start",
        $(go.Node, "Table", nodeStyle(),
            $(go.Panel, "Auto",
                $(go.Shape, "Circle",
                    { minSize: new go.Size(40, 40), fill: "#00AD5F", strokeWidth: 1 }),
                $(go.TextBlock, "Start", textStyle(),
                    new go.Binding("text"))
            ),
            // three named ports, one on each side except the top, all output only:
            makePort("L", go.Spot.Left, go.Spot.Left, true, false),
            makePort("R", go.Spot.Right, go.Spot.Right, true, false),
            makePort("B", go.Spot.Bottom, go.Spot.Bottom, true, false)
        ));

// Step Node (Default task node)
    myDiagram.nodeTemplateMap.add("step",
        $(go.Node, "Table", nodeStyle(),
            $(go.Panel, "Auto",
                $(go.Shape, "Rectangle",
                    { fill: "#00A9C9", strokeWidth: 0, minSize: new go.Size(80, 40) }),
                $(go.TextBlock, textStyle(),
                    { margin: 8, editable: true },
                    new go.Binding("text").makeTwoWay()
                )
            ),
            makePort("T", go.Spot.Top, go.Spot.TopSide, false, true),
            makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
            makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
            makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
        )
    );

// I/O Node (e.g., for inputs/outputs in flowcharts)
    myDiagram.nodeTemplateMap.add("io",
        $(go.Node, "Table", nodeStyle(),
            $(go.Panel, "Auto",
                $(go.Shape, "Parallelogram1",  // Use parallelogram for I/O
                    { fill: "#F1C232", strokeWidth: 0, minSize: new go.Size(40, 40) }),
                $(go.TextBlock, textStyle(),
                    { margin: 8, editable: true },
                    new go.Binding("text").makeTwoWay()
                )
            ),
            makePort("T", go.Spot.Top, go.Spot.TopSide, false, true),
            makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
            makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
            makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
        )
    );

// Condition Node (Decision)
    myDiagram.nodeTemplateMap.add("condition",
        $(go.Node, "Table", nodeStyle(),
            $(go.Panel, "Auto",
                $(go.Shape, "Diamond",  // Diamond shape for decisions
                    { fill: "#FFCC00", strokeWidth: 0, minSize: new go.Size(40, 20) }),
                $(go.TextBlock, textStyle(),
                    { margin: 8, editable: true },
                    new go.Binding("text").makeTwoWay()
                )
            ),
            makePort("T", go.Spot.Top, go.Spot.TopSide, false, true),
            makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
            makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
            makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
        )
    );

// End Node (Terminator)
    myDiagram.nodeTemplateMap.add("end",
        $(go.Node, "Table", nodeStyle(),
            $(go.Panel, "Auto",
                $(go.Shape, "Ellipse",  // Use ellipse shape for "End"
                    { fill: "#DC3912", strokeWidth: 0, minSize: new go.Size(60, 60) }),
                $(go.TextBlock, textStyle(),
                    { margin: 8, editable: true },
                    new go.Binding("text").makeTwoWay()
                )
            ),
            makePort("T", go.Spot.Top, go.Spot.TopSide, false, true),
            makePort("L", go.Spot.Left, go.Spot.LeftSide, true, true),
            makePort("R", go.Spot.Right, go.Spot.RightSide, true, true),
            makePort("B", go.Spot.Bottom, go.Spot.BottomSide, true, false)
        )
    );

// Comment Node
    myDiagram.nodeTemplateMap.add("comment",
        $(go.Node, "Auto", nodeStyle(),
            $(go.Shape, "File",  // Use File shape for comments
                { fill: "#E3F2FD", strokeWidth: 0 }),
            $(go.TextBlock, "Comment",  // Default text in comment nodes
                {
                    margin: 8,
                    maxSize: new go.Size(200, NaN),
                    wrap: go.TextBlock.WrapFit,
                    textAlign: "center",
                    editable: true,
                    font: "italic 10pt sans-serif",
                    stroke: "#36454F"
                },
                new go.Binding("text").makeTwoWay()
            )
        )
    );

    // Link Template
    myDiagram.linkTemplate =
        $(go.Link,
            {
                routing: go.Link.AvoidsNodes,
                curve: go.Link.JumpOver,
                corner: 5, toShortLength: 4,
                relinkableFrom: true, relinkableTo: true, reshapable: true, resegmentable: true,
                mouseEnter: (e, link) => { link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)"; },
                mouseLeave: (e, link) => { link.findObject("HIGHLIGHT").stroke = "transparent"; },
                selectionAdorned: false
            },
            new go.Binding("points").makeTwoWay(),
            $(go.Shape, { isPanelMain: true, strokeWidth: 8, stroke: "transparent", name: "HIGHLIGHT" }),
            $(go.Shape, { isPanelMain: true, stroke: "gray", strokeWidth: 2 },
                new go.Binding("stroke", "isSelected", sel => sel ? "dodgerblue" : "gray").ofObject()
            ),
            $(go.Shape, { toArrow: "standard", strokeWidth: 0, fill: "gray" }),
            $(go.Panel, "Auto",
                { visible: false, name: "LABEL", segmentIndex: 2, segmentFraction: 0.5 },
                new go.Binding("visible", "visible").makeTwoWay(),
                $(go.Shape, "RoundedRectangle", { fill: "#F8F8F8", strokeWidth: 0 }),
                $(go.TextBlock, "Yes", { textAlign: "center", font: "10pt helvetica, arial, sans-serif", stroke: "#333333", editable: true },
                    new go.Binding("text").makeTwoWay()
                )
            )
        );

    // Show link label based on the condition node
    function showLinkLabel(e) {
        var label = e.subject.findObject("LABEL");
        if (label !== null) label.visible = (e.subject.fromNode.data.category === "condition");
    }

    // Define the Palette (Toolbox)
    myPalette = $(go.Palette, "myPaletteDiv",
        {
            nodeTemplateMap: myDiagram.nodeTemplateMap,  // share the templates
            model: new go.GraphLinksModel([
                { category: "start", text: "Start" },
                { category: "step", text: "Step" },
                { category: "io", text: "Input/Output" },
                { category: "condition", text: "Condition" },
                { category: "end", text: "End" },
                { category: "comment", text: "Comment" }
            ])
        }
    );

    // Load an initial diagram from JSON data (replace `load_graph()` if necessary)
    load();  // function that loads the diagram model
}

function save() {
    document.getElementById("mySavedModel").value = myDiagram.model.toJson();
    myDiagram.isModified = false;
}
function load() {
    myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
}


window.addEventListener('DOMContentLoaded', init);