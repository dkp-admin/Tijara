package expo.modules.tijarahzatca.utils

import org.w3c.dom.*
import org.xml.sax.InputSource
import java.io.StringReader
import java.io.StringWriter
import javax.xml.parsers.DocumentBuilderFactory
import javax.xml.transform.OutputKeys
import javax.xml.transform.TransformerFactory
import javax.xml.transform.dom.DOMSource
import javax.xml.transform.stream.StreamResult

typealias XMLObject = MutableMap<String, Any?>
typealias XMLQueryResult = List<XMLObject>?

class XMLDocument(
    xmlStr: String? = null
) {
    private var document: Document

    init {
        document = if (xmlStr != null) {
            parseXmlString(xmlStr)
        } else {
            createEmptyDocument()
        }
    }

    private fun parseXmlString(xmlStr: String): Document {
        val factory = DocumentBuilderFactory.newInstance()
        factory.isNamespaceAware = true
        val builder = factory.newDocumentBuilder()
        return builder.parse(InputSource(StringReader(xmlStr)))
    }

    private fun createEmptyDocument(): Document {
        val factory = DocumentBuilderFactory.newInstance()
        factory.isNamespaceAware = true
        val builder = factory.newDocumentBuilder()
        return builder.newDocument()
    }

    fun get(pathQuery: String? = null, condition: Map<String, String>? = null): XMLQueryResult {
        if (pathQuery.isNullOrBlank()) return null

        val elements = findElementsByPath(pathQuery)
        if (condition == null) {
            return elements.map { domElementToMap(it) }
        }

        // Filter by condition
        return elements.filter { element ->
            condition.all { (key, value) ->
                val childElement = findChildElementByTagName(element, key)
                childElement?.textContent?.trim() == value
            }
        }.map { domElementToMap(it) }
    }

    fun delete(pathQuery: String? = null, condition: Map<String, String>? = null): Boolean {
        if (pathQuery.isNullOrBlank()) return false

        val elements = findElementsByPath(pathQuery)
        if (elements.isEmpty()) return false

        val elementsToDelete = if (condition == null) {
            elements
        } else {
            // Filter elements that match the condition
            elements.filter { element ->
                condition.all { (key, value) ->
                    val childElement = findChildElementByTagName(element, key)
                    childElement?.textContent?.trim() == value
                }
            }
        }

        // Remove the elements
        elementsToDelete.forEach { element ->
            element.parentNode?.removeChild(element)
        }

        return elementsToDelete.isNotEmpty()
    }

    fun set(
        pathQuery: String,
        overwrite: Boolean,
        setXml: Any
    ): Boolean {
        // For simplicity, this implementation is basic
        // Can be extended as needed
        return false
    }

    private fun findElementsByPath(pathQuery: String): List<Element> {
        val pathParts = pathQuery.split("/").filter { it.isNotEmpty() }
        var currentElements = listOf<Element>(document.documentElement)

        for (part in pathParts) {
            val nextElements = mutableListOf<Element>()
            for (element in currentElements) {
                if (element.tagName == part || element.nodeName == part) {
                    // If this is the root element and matches, add it
                    if (currentElements.size == 1 && currentElements[0] == document.documentElement) {
                        nextElements.add(element)
                    }
                } else {
                    // Look for child elements with this tag name
                    val children = getChildElementsByTagName(element, part)
                    nextElements.addAll(children)
                }
            }
            currentElements = nextElements
            if (currentElements.isEmpty()) break
        }

        return currentElements
    }

    private fun getChildElementsByTagName(parent: Element, tagName: String): List<Element> {
        val result = mutableListOf<Element>()
        val nodeList = parent.childNodes
        for (i in 0 until nodeList.length) {
            val node = nodeList.item(i)
            if (node is Element && (node.tagName == tagName || node.nodeName == tagName)) {
                result.add(node)
            }
        }
        return result
    }

    private fun findChildElementByTagName(parent: Element, tagName: String): Element? {
        val nodeList = parent.childNodes
        for (i in 0 until nodeList.length) {
            val node = nodeList.item(i)
            if (node is Element && (node.tagName == tagName || node.nodeName == tagName)) {
                return node
            }
        }
        return null
    }

    private fun domElementToMap(element: Element): XMLObject {
        val result = mutableMapOf<String, Any?>()

        // Add attributes
        val attributes = element.attributes
        for (i in 0 until attributes.length) {
            val attr = attributes.item(i)
            result["@${attr.nodeName}"] = attr.nodeValue
        }

        // Add text content if present and no child elements
        val childElements = getChildElements(element)
        if (childElements.isEmpty()) {
            val textContent = element.textContent?.trim()
            if (!textContent.isNullOrEmpty()) {
                result["#text"] = textContent
            }
        }

        // Add child elements
        val childElementsMap = mutableMapOf<String, MutableList<XMLObject>>()
        for (childElement in childElements) {
            val childMap = domElementToMap(childElement)
            val tagName = childElement.tagName
            if (!childElementsMap.containsKey(tagName)) {
                childElementsMap[tagName] = mutableListOf()
            }
            childElementsMap[tagName]!!.add(childMap)
        }

        // Add child elements to result
        childElementsMap.forEach { (tagName, children) ->
            result[tagName] = if (children.size == 1) children[0] else children
        }

        return result
    }

    private fun getChildElements(parent: Element): List<Element> {
        val result = mutableListOf<Element>()
        val nodeList = parent.childNodes
        for (i in 0 until nodeList.length) {
            val node = nodeList.item(i)
            if (node is Element) {
                result.add(node)
            }
        }
        return result
    }

    fun toString(noHeader: Boolean = false): String {
        val transformerFactory = TransformerFactory.newInstance()
        val transformer = transformerFactory.newTransformer()

        if (noHeader) {
            transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes")
        } else {
            transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "no")
        }

        transformer.setOutputProperty(OutputKeys.INDENT, "yes")
        transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "4")

        val source = DOMSource(document)
        val writer = StringWriter()
        val result = StreamResult(writer)

        transformer.transform(source, result)

        return writer.toString()
    }
}