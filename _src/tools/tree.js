function list_to_tree(list) {
    const map = {};
    const roots = [];

    let node, i;

    for (i = 0; i < list.length; i += 1) {
        map[list[i].id] = i; // initialize the map
        list[i].children = []; // initialize the children
    }
    for (i = 0; i < list.length; i += 1) {
        node = list[i];
        if (node.parent !== "0") {
            // if you have dangling branches check that map[node.parent] exists
            list[map[node.parent]].children.push(node);
        } else {
            roots.push(node);
        }
    }
    return roots;
}

function tree_to_collection(tree, key, collection,m_array) {
    if (!tree[key] || tree[key].length === 0) return;
    for (let i = 0; i < tree[key].length; i++) {
        const child = tree[key][i]
        collection[child.id] = child;
        m_array.push(child);
        tree_to_collection(child, key, collection,m_array);
    }
    return;
}


function findAncestors(nodeId, lookup) {
    const ancestors = [nodeId];
    const group = lookup.find(x => x.id === nodeId);
    let parentId = group && group.parent;
    while (parentId !== 1 && parentId != undefined) {
        ancestors.unshift(parentId);
        parentId = lookup.find(x => x.id == parentId).parent;
    }
    return ancestors;
}

export default {
    list_to_tree,
    tree_to_collection,
    findAncestors,
};