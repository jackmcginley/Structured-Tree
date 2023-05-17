'use strict'

class TreeNode {
    constructor(nodeId, text = nodeId, width =0) {
        this.nodeId = nodeId;
        this.text = text;
        this.width = width;
    }
}

class Tree {
    constructor(name) {
        this.name = name;
        this.nodeArray = [];
        const rootArray = new Array;
        rootArray.push("0");
        this.nodeArray.push(rootArray);
        this.root = this.nodeArray[0][0];
        this.allColumns = [];
        this.usableColumns = [];
        this.nodeObjectArray = [];
        const rootObjectArray = new Array;
        const rootObject= new TreeNode("0");
        rootObjectArray.push(rootObject);
        this.nodeObjectArray.push(rootObjectArray);

    }


    createChildNodeOf(currentNodeId, childText) {
        const childLevel = currentNodeId.length;
        let fullArray = this.nodeArray[0];
        for (let i = 1; i < this.nodeArray.length; i++) {
            fullArray = fullArray.concat(this.nodeArray[i]);
        }
        // check if thhe currentNodeId passed as an argument is a valid node Id in the current set of node IDs.
        let validNode = false;
        for (let i = 0; i < fullArray.length; i++) {
            if (currentNodeId === fullArray[i]) {
                validNode = true;
            }
        }
        if (!validNode) {
            alert("Not a valid node ID");
            return
        }
        const arrayAtChildLevel = this.nodeArray[childLevel];


        if (!arrayAtChildLevel) {
            const childId = currentNodeId.padEnd(childLevel + 1, "1");
            const childArray = new Array;
            childArray.push(childId);
            this.nodeArray.push(childArray);
            const childObject = new TreeNode(childId, childText);
            const childObjectArray = new Array;
            childObjectArray.push(childObject);
            this.nodeObjectArray.push(childObjectArray);
            return;

        }
        else {
            const nodesAtChildLevel = this.nodeArray[childLevel].length;
            let currentChildren = 0;
            for (let i = 0; i < nodesAtChildLevel; i++) {
                if (currentNodeId === this.nodeArray[childLevel][i].slice(0, childLevel)) {
                    currentChildren++;
                }
            }
            // Check that node digits do not run into double figures by restricting no more than 9 children at any node.  Having a double digit would upset the logic which uses length of the nodeId string to determine levels etc.
            if (currentChildren >= 9) {
                alert("This node already has 9 children.  Max branches on this node,cannot create another branch.");
                return;
            }
            const childId = currentNodeId.padEnd(childLevel + 1, (currentChildren + 1).toString());
            this.nodeArray[childLevel].push(childId);
            const childObject = new TreeNode(childId, childText);
            this.nodeObjectArray[childLevel].push(childObject);
            // Its essential to sort the nodes into ascending order so that they are positioned correctly on the grid.
            this.nodeObjectArray[childLevel].sort((a,b)=>a.nodeId-b.nodeId);
            return;
        }

    }
    // This display mode is deprecated in favour of createOrderedGridDisplay.
    createGridDisplay() {
        let gridCols = 1;
        for (let i = 0; i < this.nodeArray.length; i++) {
            if (this.nodeArray[i].length > gridCols) {
                gridCols = this.nodeArray[i].length;
            }
        }
        const gridRows = this.nodeArray.length;

        let colString = " "
        for (let i = 1; i <= gridCols; i++) {
            colString = colString.concat("auto ");
        }
        // Create the grid container with number of columns equal to the max number of tree nodes at any one level.
        const gridContainer = document.createElement("div");
        gridContainer.classList.add("grid-container");
        gridContainer.id = "gridContainer";
        document.getElementById("main").appendChild(gridContainer);
        for (let i = 0; i < this.nodeArray.length; i++) {
            const levelNodeArray = this.nodeArray[i];
            const gridRow = i + 1;
            for (let j = 0; j < levelNodeArray.length; j++) {
                const gridCol = j + 1;
                const gridItem = document.createElement("div");
                gridItem.style.setProperty("grid-row", gridRow);
                gridItem.style.setProperty("grid-column", gridCol)
                gridItem.innerText = levelNodeArray[j];
                document.getElementById("gridContainer").appendChild(gridItem);
            }
        }

    }
  
    // Display the full tree using a flex layout.  This display mode is deprecated in favour of createOrderedGridDisplay.
    createFlexDisplay() {
        const flexContainer = document.createElement("div");
        flexContainer.id = "flexContainer";
        flexContainer.classList.add("tree-flex-container");
        document.getElementById("main").appendChild(flexContainer);
        // Create a row of nodes for each level in the tree
        for (let i = 0; i < this.nodeArray.length; i++) {
            const levelNodeArray = this.nodeArray[i];
            const flexRow = document.createElement("div");
            flexRow.id = `level ${i}`;
            flexRow.classList.add("flex-row");
            document.getElementById("flexContainer").appendChild(flexRow);
            // Create an item in the row for each node.
            for (let j = 0; j < levelNodeArray.length; j++) {
                const flexItem = document.createElement("div");
                flexItem.classList.add("flex-item");
                flexItem.setAttribute("data-nodeid", levelNodeArray[j]);
                flexItem.setAttribute("data-isstem", "false");
                flexItem.innerText = levelNodeArray[j];
                //  Add a link with symbol at top right of any flexitem which has further branches stemming from it
                if (this.isStem(levelNodeArray[j])) {
                    const symbol = document.createElement("a");
                    symbol.innerText = "X";
                    symbol.classList.add("symbol");
                    symbol.href = "javascript:void(0)";
                    flexItem.setAttribute("data-isstem", "true");
                    flexItem.appendChild(symbol);
                }
                document.getElementById(`level ${i}`).appendChild(flexItem);
            }
        }
        return flexContainer;
    }
  // Display the full tree aligned with parent-child in proper relative positions.
    createOrderedGridDisplay(){
        const rows = this.nodeArray.length;
        for (let i=0; i<rows; i++){
            this.createGridCells(i);
        }
    }

// This calculates  the full branch of ancestor nodes from the argument node, and passes it back as an array
    getParentBranchArray(nodeId) {
        let parentBranchArray = [];
        parentBranchArray.push(nodeId);
        let nodeDigits = nodeId.length;
        while (nodeDigits > 1) {
            nodeId = nodeId.slice(0, -1);
            parentBranchArray.push(nodeId);
            nodeDigits--;
        }
        return parentBranchArray;
    }

    // If number of nodes at child level with same first n digits as the argument node is >1 then that node is the root for further branches.
    isStem(nodeObjectId) {
        const childLevel = nodeObjectId.length;
        const arrayAtChildLevel = this.nodeObjectArray[childLevel];
        let stem = false;
        if (!arrayAtChildLevel) {
            return stem;
        }
        let children = 0;
        for (let i = 0; i < this.nodeObjectArray[childLevel].length; i++) {
            if (nodeObjectId === this.nodeObjectArray[childLevel][i].nodeId.slice(0, childLevel)) {
                children++;
            }
        }
        if (children > 1) {
            stem = true;
        }
        return stem;
    }
    // Determine if the node is a leaf of the tree (ie has no child nodes)
    isLeaf(nodeObjectId){
        let isLeaf = true;
        const n = nodeObjectId.length;
        // nodes at bottom level are leafs
        if(n===this.nodeObjectArray.length){
            return isLeaf;
        }
        for (let i=0; i<this.nodeObjectArray[n].length; i++){
            const tryNode = this.nodeObjectArray[n][i].nodeId;
            if(tryNode.slice(0,-1)===nodeObjectId){
                isLeaf = false;
            }
        }
        return isLeaf;
    }
  // Iterate through all levels in tree and populate the widths of each node at every level.  Needs to be done starting at bottom level.
  setAllWidths(){
    const levels = this.nodeObjectArray.length;
    for(let i=levels-1; i>=0; i--){
        this.setWidths(i);
    }

    }
    // Iterate through all the nodes at a given level and populate the nodeWidthArray
    setWidths(level){
        for(let i=0; i<this.nodeArray[level].length; i++){
            // const nodeId = this.nodeArray[level][i];
            // this.calculateWidth(nodeId);
            const nodeObjectId = this.nodeObjectArray[level][i].nodeId;
            this.calculateObjectWidth(nodeObjectId);
        }
    }

    calculateObjectWidth(nodeObjectId){
        let nodeObjectWidth = 0;
        let childCount = 0;
        const n = nodeObjectId.length;
        
        // All nodes at bottom level of tree must be a leaf so width = 1
        if(n ===this.nodeObjectArray.length){
            this.setNodeObjectWidth(nodeObjectId,1);
            return
        }
        for (let i=0; i<this.nodeObjectArray[n].length; i++){
            const tryNode = this.nodeObjectArray[n][i];
            if(tryNode.nodeId.slice(0,-1)===nodeObjectId){
                childCount++;
                nodeObjectWidth = nodeObjectWidth + this.nodeObjectArray[n][i].width;
            }
        }
        if(!childCount){nodeObjectWidth=1};
        this.setNodeObjectWidth(nodeObjectId, nodeObjectWidth);

    }

    setNodeObjectWidth(nodeObjectId, objectWidth){
        const n = nodeObjectId.length-1; 
        for (let i=0; i<this.nodeObjectArray[n].length; i++){
            if(nodeObjectId ===this.nodeObjectArray[n][i].nodeId){
                this.nodeObjectArray[n][i].width=objectWidth;
                return
            }
        }
    }

  
    getTotalWidthAtLevel(level){
        let totalWidth = 0
        for(let i=0; i< this.nodeObjectArray[level].length; i++){
            totalWidth = totalWidth + this.nodeObjectArray[level][i].width;
        }
        return totalWidth;
    }

    // After determining the widths of each node and constructing the nodeWidthArray, create arrays in the tree object for all and usable columns.
    initialiseAllColumns(){
        const totalColumns = this.nodeObjectArray[0][0].width;
        if(userTree){
            let cols = [];
            for( let i=0; i<totalColumns; i++){
                cols[i] = "auto"
            }
            const colString = cols.join(' ');
            document.getElementById("grid-container-user").style.gridTemplateColumns = colString;
        }
        for (let i=0; i<totalColumns; i++){
            this.allColumns[i]= i+1;
            this.usableColumns[i]= i+1;
        }
        
    }
    // Create a div which will be a cell in the grid, positioned based on the width allgorithm.  The first entry in the usableCols array is manipulated to ensure that it always contains the starting columns to position the node in the grid.
    createGridCells(level){
        let usableCols = [...this.usableColumns];
        let gridContainer = document.getElementById("grid-container-demo");
        if (userTree){
            gridContainer = document.getElementById("grid-container-user");
        }

        for(let i=0; i<this.nodeObjectArray[level].length;i++){
            const nodeObjectId = this.nodeObjectArray[level][i].nodeId;
            const nodeWidth = this.nodeObjectArray[level][i].width;
            const rowStart = level+1;
            const rowEnd = rowStart+1;
            const colStart = usableCols[0];
            const colEnd = colStart + nodeWidth;
            const gridCell =  document.createElement("div")
            gridCell.setAttribute("id", nodeObjectId);
            gridCell.setAttribute("style", `grid-area: ${rowStart} / ${colStart} / ${rowEnd} / ${colEnd}`);
            gridCell.setAttribute("data-nodeid", `${nodeObjectId}`);
            if(!userTree){
                gridCell.innerHTML = `<span class = 'grid-span w3-brown'>${nodeObjectId}</span>`;
            }else{
                gridCell.classList.add("userdiv");
                if(level===0){
                    gridCell.innerHTML = `<span class = 'grid-span w3-brown'>${this.nodeObjectArray[level].text}</span>`;
                }else
                gridCell.innerHTML = `<span class = 'grid-span w3-brown'>${this.nodeObjectArray[level][i].text}</span>`;
            }
            gridContainer.appendChild(gridCell);
            // block out the columns below any leaf by removing that columns from the usable columns array.
            if (level>0){
                if(this.isLeaf(nodeObjectId)){
                    const colToRemove = usableCols[0];
                    this.usableColumns = this.usableColumns.filter(num => num !== colToRemove);
                }
            }
            // Remove the number of items from the usableCols array on this row according to the node width.  eg if width = 2 remove 2 items.
            for (let j=1; j<= nodeWidth; j++){
                usableCols.shift()
            }
           
            
        }
    }
    
}

// Construct the demo tree manually
let userTree = false;
const firstTree = new Tree("test");

firstTree.createChildNodeOf("0");
firstTree.createChildNodeOf("0");
firstTree.createChildNodeOf("01");
firstTree.createChildNodeOf("01");
firstTree.createChildNodeOf("01");
firstTree.createChildNodeOf("011");
firstTree.createChildNodeOf("0111");
firstTree.createChildNodeOf("01111");
firstTree.createChildNodeOf("012");
firstTree.createChildNodeOf("0121");
firstTree.createChildNodeOf("01211");
firstTree.createChildNodeOf("01211");
firstTree.createChildNodeOf("013");
firstTree.createChildNodeOf("013");
firstTree.createChildNodeOf("013");
firstTree.createChildNodeOf("0132");
firstTree.createChildNodeOf("0132");

firstTree.setAllWidths();
firstTree.initialiseAllColumns();
firstTree.createOrderedGridDisplay();

const gridContainer = document.getElementById("grid-container-demo");
gridContainer.addEventListener("mouseover", showBranch.bind(firstTree));
function showBranch(mouseover) {
    const activeNode = mouseover.target.closest(".grid-span");
    // if mouse within the grid container but outside of an actual node simply return to prevent warning
    if (!activeNode) {
        return
    }
    // const nodeId = activeNode.innerText;
    // get the nodeId from the parent div of the span that was clicked
    const nodeId = activeNode.parentElement.dataset.nodeid;
    let thisGrid = gridContainer;
    if(this.name==="user") thisGrid= gridContainerUser;
    
    const branch = this.getParentBranchArray(nodeId);
    const allNodes = thisGrid.querySelectorAll('.grid-span');
    for (let i = 0; i < allNodes.length; i++) {
        allNodes[i].classList.add("fade");
    }
  
    for (let i = 0; i < branch.length; i++) {
        for(let j=0; j<allNodes.length; j++){
            if(allNodes[j].parentElement.dataset.nodeid ==branch[i]){
                allNodes[j].classList.remove("fade");
                allNodes[j].classList.add("highlight");
            }
        }
    }
}
// When mouse leaves the node clear the highlighting
gridContainer.addEventListener("mouseout", hideBranch.bind(firstTree));
function hideBranch() {
    let thisGrid = gridContainer;
    if(this.name==="user") thisGrid= gridContainerUser;
    const allNodes = thisGrid.querySelectorAll('.grid-span');
    for (let i = 0; i < allNodes.length; i++) {
        allNodes[i].classList.remove("highlight");
        allNodes[i].classList.remove("fade");

    }
}

// Now build and display the user's tree
const tree = new Tree("user");
userTree = true;
const gridContainerUser = document.getElementById("grid-container-user");
gridContainerUser.classList.add("hidden");
// get the title for the user's tree and save it at root node of the new tree object
const userBtn = document.getElementById("createTreeBtn");
userBtn.addEventListener("click", displayUserTree);

function displayUserTree(){
    const rootName = document.getElementById("usertree").value;
    gridContainerUser.classList.remove("hidden");
    if(!rootName){
        alert("Please enter a short title for your tree");
        return;
    } else{
        tree.nodeObjectArray[0].text=rootName;
    }
    tree.setAllWidths();
    tree.initialiseAllColumns();
    tree.createOrderedGridDisplay();
    window.scrollTo(0, document.body.scrollHeight);
    userBtn.removeEventListener("click", displayUserTree);
}

// Set click event listener on the user tree nodes to add a new child  node, clear and rebuild the tree.
gridContainerUser.addEventListener('click', function(e) {
const activeNode = e.target.closest(".grid-span");
// if mouse within the grid container but outside of an actual node simply return to prevent warning
if (!activeNode) {
return
}
const nodeId = activeNode.parentElement.dataset.nodeid;
const nodeNames = prompt("Please enter child node names, separated by / character if more than one ");
if(!nodeNames) { 
    alert("You did not enter a name for the node");
    return;
}
const newNodes = nodeNames.split("/");
for (let i=0; i<newNodes.length; i++){
    const nodeName = newNodes[i];
    tree.createChildNodeOf(nodeId, nodeName);
    clearTree();
    rebuildTree();
}
});
  
function clearTree(){
    const oldTree = [...document.getElementsByClassName("userdiv")];
    for (let i=0; i<oldTree.length;i++){
        oldTree[i].remove();

    }
}  

function rebuildTree(){
    tree.setAllWidths();
    tree.initialiseAllColumns();
    tree.createOrderedGridDisplay();
    window.scrollTo(0, document.body.scrollHeight);
   
}
gridContainerUser.addEventListener("mouseover", showBranch.bind(tree));
gridContainerUser.addEventListener("mouseout", hideBranch.bind(tree));
  
  






// // firstTree.createGridDisplay();
// const flexContainer = firstTree.createFlexDisplay();
// // Event listener for the symbol that indicates the node is a stem
// flexContainer.addEventListener("click", symbolFunction);
// function symbolFunction(clicked) {
//     const targetItem = clicked.target.closest('.symbol');
//     if (!targetItem) {
//         return
//     }
//     targetItem.classList.add("clicked-item");
// }
// // Highlight the full branch from the node that has the mouse
// flexContainer.addEventListener("mouseover", showBranch)
// function showBranch(mouseover) {
//     const activeNode = mouseover.target.closest(".flex-item");
//     // if mouse within the flex container but outside of an actual node (flex-item) simply return to prevent warning
//     if (!activeNode) {
//         return
//     }
//     const nodeId = activeNode.dataset.nodeid;
//     const branch = firstTree.getParentBranchArray(nodeId);
//     for (let i = 0; i < branch.length; i++) {
//         const element = document.querySelector('[data-nodeid="' + branch[i] + '"]');
//         element.classList.add("highlight");
//     }

// }
// // When mouse leaves the node clear the highlighting
// flexContainer.addEventListener("mouseout", hideBranch)
// function hideBranch(mouseover) {
//     const allNodes = document.querySelectorAll('.flex-item');
//     for (let i = 0; i < allNodes.length; i++) {
//         allNodes[i].classList.remove("highlight");
//     }
// }