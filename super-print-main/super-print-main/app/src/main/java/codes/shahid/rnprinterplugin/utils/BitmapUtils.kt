package codes.shahid.rnprinterplugin.utils

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.text.Layout
import android.text.SpannableStringBuilder
import android.text.Spanned
import android.text.StaticLayout
import android.text.TextPaint
import android.text.style.ImageSpan
import android.util.Log
import java.io.File
import java.io.FileOutputStream

object BitmapUtils {
    fun saveBitmapToCache(context: Context, bitmap: Bitmap, fileName: String) {
        val file = File(context.cacheDir, fileName)
        FileOutputStream(file).use { out ->
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
        }
    }

    fun loadBitmapFromCache(context: Context, fileName: String): Bitmap? {
        val file = File(context.cacheDir, fileName)
        return if (file.exists()) {
            BitmapFactory.decodeFile(file.absolutePath)
        } else null
    }

    fun getBitmap(
        context: Context,
        text: String,
        textSize: Int,
        typeface: Typeface,
        alignment: Layout.Alignment
    ): Bitmap {
        val mPaint = TextPaint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.BLACK
            this.typeface = typeface
            this.textSize = textSize.toFloat()
        }

        val updatedText = text.replace(Regex("SAR(?=\\d)"), "SAR ")
        val spannable = SpannableStringBuilder(updatedText)
        val regex = Regex("SAR(?=\\s)")
        val matches = regex.findAll(updatedText).toList().reversed()
        Log.d("GETBITMAP",matches.toString())

        val fm = mPaint.fontMetrics
        val textHeight = (fm.descent - fm.ascent).toInt()

        val cacheFileName = "faded_riyal.png"
        val fadedBitmap: Bitmap? = loadBitmapFromCache(context, cacheFileName) ?: try {
            context.assets.open("riyal.png").use { inputStream ->
                val original = BitmapFactory.decodeStream(inputStream)
                val imageSize = (textHeight * 0.90).toInt()

                val scaled = Bitmap.createScaledBitmap(original, imageSize, imageSize, true)
                original.recycle()

                val faded = Bitmap.createBitmap(imageSize, imageSize, Bitmap.Config.ARGB_8888)
                val fadedCanvas = Canvas(faded)
                val fadedPaint = Paint().apply { alpha = 230 }
                fadedCanvas.drawBitmap(scaled, 0f, 0f, fadedPaint)
                scaled.recycle()

                // Save to cache
                saveBitmapToCache(context, faded, cacheFileName)

                faded
            }
        } catch (e: Exception) {
            null
        }

        // Apply spans
        fadedBitmap?.let {
            for (match in matches) {
                val imageSpan = ImageSpan(context, it, ImageSpan.ALIGN_BOTTOM)
                spannable.setSpan(
                    imageSpan,
                    match.range.first,
                    match.range.last + 1,
                    Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
                )
            }
        }

        // Layout and draw
        val width = 730
        val staticLayout = StaticLayout.Builder
            .obtain(spannable, 0, spannable.length, mPaint, width)
            .setAlignment(alignment)
            .setLineSpacing(0f, 1.0f)
            .setIncludePad(false)
            .build()

        val height = staticLayout.height
        val resultBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(resultBitmap)
        canvas.drawColor(Color.WHITE)
        staticLayout.draw(canvas)

        return resultBitmap
    }
}
