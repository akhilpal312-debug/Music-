package dev.lelonio.square.ui.components

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import dev.lelonio.square.R
import dev.lelonio.square.ui.player.GlassInkDim

/**
 * The app asking for a star on the repository it is published from.
 *
 * The same pane as every other sheet — glass, one heading, two capsules of
 * equal weight — because it is one more thing the app has to say, not a system
 * dialog that belongs to somebody else. It is asked once and then not again:
 * the button either takes the person to the page or puts the question away for
 * the interval the repository names.
 *
 * [title] and [body] are what the repository's `star.json` says, and empty when
 * it says nothing, in which case the app's own words are used.
 */
@Composable
fun StarSheet(
    title: String,
    body: String,
    onStar: () -> Unit,
    onLater: () -> Unit,
    visible: Boolean,
) {
    GlassSheet(
        visible = visible,
        onDismiss = onLater,
        enableDrag = true,
        scrollable = false,
        contentPadding = PaddingValues(horizontal = 20.dp),
    ) {
        SheetTitle(title.ifBlank { stringResource(R.string.star_title) })
        Text(
            body.ifBlank { stringResource(R.string.star_body) },
            style = MaterialTheme.typography.bodyMedium,
            color = GlassInkDim,
            textAlign = TextAlign.Center,
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 14.dp),
        )
        SheetButtons(
            cancel = onLater,
            cancelLabel = stringResource(R.string.star_later),
            confirmLabel = stringResource(R.string.star_action),
            confirm = onStar,
        )
    }
}
