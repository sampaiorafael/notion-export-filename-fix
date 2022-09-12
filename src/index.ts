import * as fs from 'fs'
import * as PATH from 'path'

/**
 * For some reason i need to run this shit few times to it work fully
 * Each run, it does part of the fucking job
 * Idk why this shit is like this, i fucking tried but i dont evencare anymore
 */

// Example '/mnt/c/Users/Myself/Downloads/Export-d379cf28-bf83-4cdc-b239-53595dea9e0i'
const BASE_FOLDER_PATH = ''
const HASH_SIZE = 32

interface Node {
  path: string,
  children: Node[]
}

class NodeTree {

  baseFolderPath: string
  hashSize: number
  nodeTree: Node
  nodeCount: number = 0

  constructor(baseFolderPath: string, hashSize: number) {
    this.baseFolderPath = baseFolderPath
    this.hashSize = hashSize
    this.run()
  }

  public async run () {
    this.nodeTree = await this.buildTree()
    for (let i = 0; i < 10; i++) {
      await this.eachNode(this.nodeTree)
      console.log(`${i} of ${this.nodeCount}`)
    }
    console.log('***** End *****')
  }

  public async eachNode (node: Node){
    await this.renameNode(node)
    // Recursive to garantee the code above will run for each node
    if(node.children) node.children.forEach(async (child) => await this.eachNode(child))
  }

  public async renameNode(node: Node): Promise<void> {
    const nodePathStats = PATH.parse(node.path) //PATH.format(nodePathStats)
    //nodePathStats.base = nodePathStats.base.replace(/\b\s+[a-zA-Z0-9]{32}/g, '')
    fs.rename(node.path, node.path.replace(/\b\s+[a-zA-Z0-9]{32}/g, ''), async (err) => {
      if(err) {
        console.log(`Error: ${nodePathStats.base}`)
        //await this.eachNode(node) 
      } else {
        console.log(`Success: ${nodePathStats.base}`)
        node.path = node.path.replace(/\b\s+[a-zA-Z0-9]{32}/g, '')     
        if(nodePathStats.ext === '.md') await this.renameMarkdown(node)
      }
    })
  }

  public async renameMarkdown(node: Node) {
    const fileData = fs.readFileSync(node.path, 'utf-8')
    const newFileData = fileData.replace(/%20[a-zA-Z0-9]{32}/g, '')
    fs.writeFileSync(node.path, newFileData, 'utf-8')
  }

  public async buildTree(): Promise<Node> {

    const rootNode: Node = {
      path: this.baseFolderPath,
      children: []
    }
  
    const tree = [rootNode]
  
    while (tree.length) {
      const currentNode = tree.pop()
  
      if (currentNode) {
        const children = fs.readdirSync(currentNode.path)
        for (let child of children) {
          const childPath = `${currentNode.path}/${child}`
          const childNode: Node = {
            path: childPath,
            children: []
          }

          this.nodeCount++
          currentNode.children.push(childNode)
          const childIsDir = fs.statSync(childNode.path).isDirectory()
          if (childIsDir) tree.push(childNode)
        }
      }
    }
  
    return rootNode
  }
}

new NodeTree(BASE_FOLDER_PATH, HASH_SIZE)