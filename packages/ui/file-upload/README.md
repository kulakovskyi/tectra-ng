# File upload

Pick files by dropping them on a zone or browsing for them. The component checks the type, size and count, previews images, shows every file with its size and status, and uploads them — to a `url`, or through your own code with progress. One file replaces the zone with a card; many files collect in a list below it. `mode="basic"` is a single button for places like a profile photo.

```html
<tx-file-upload accept=".csv" [maxFileSize]="10 * 1024 * 1024" description="CSV, up to 10 MB" [(file)]="importFile" />

<tx-file-upload multiple accept="image/*" [fileLimit]="5" url="/api/photos" (uploaded)="refresh()" />

<tx-file-upload multiple [customUpload]="true" (uploadHandler)="send($event)" />
```

With `customUpload`, `uploadHandler` gives you the files and three callbacks: `progress(value, file?)`, `complete(file?)` and `fail(message?, file?)` — leave out `file` to update all of them. With `url` the files go as one `FormData` request (`HttpClient` when the app provides it, so interceptors apply; `XMLHttpRequest` otherwise).

The value of a form control is the `File` (or `null`), or the `File[]` with `multiple`.

## Inputs
| Name | Description |
|---|---|
| mode | `advanced` (drop zone, list) or `basic` (a button) |
| files | Two-way: the picked files that are not uploaded yet |
| file | Two-way: the picked file without `multiple` |
| multiple | Many files; new picks are added to the list |
| accept | Allowed types, checked on pick and drop: extensions (`.csv`), MIME types (`application/pdf`) and wildcards (`image/*`) |
| maxFileSize | Largest file in bytes |
| fileLimit | Most files with `multiple`, uploaded ones included |
| disabled | Turns the control off |
| invalid | Red outline; follows the form control by default |
| auto | Uploads right after the files are picked |
| url | Address to upload to |
| name | Field name of the files in the `FormData` |
| method | `post` or `put` |
| headers | Request headers, `HttpHeaders` or a plain object |
| withCredentials | Sends cookies with the request |
| customUpload | Hands the files to `uploadHandler` instead of sending them |
| keepUploaded | `false` drops a file from the list a moment after it shows "Uploaded"; `true` (default) keeps uploaded files until they are removed or `clearUploaded()` runs |
| description | Hint under the prompt, e.g. the types and the size limit |
| chooseLabel | Text of the browse link and the basic button |
| uploadLabel | Text of the Upload button |
| cancelLabel | Text of the Clear button |
| chooseIcon | Icon of the basic button |
| uploadIcon | Icon of the Upload button |
| cancelIcon | Icon of the Clear button and of the remove buttons in the list |
| showUploadButton | Shows the Upload button when there is a `url` or `customUpload` and no `auto` |
| showCancelButton | Shows the Clear button next to it |
| showMessages | Shows the reasons for rejected files under the zone; turn it off to show them yourself from `rejected` |
| invalidFileTypeMessage | Own text for a wrong type: `{name}`, `{types}` |
| invalidFileSizeMessage | Own text for a big file: `{name}`, `{size}` |
| invalidFileLimitMessage | Own text for too many files: `{limit}` |
| ariaLabel | Accessible name of the drop zone instead of its prompt |
| dt | Design tokens of this instance (`fileUpload`) |
| pt | Classes and styles of the parts: `root`, `dropzone`, `icon`, `prompt`, `hint`, `list`, `file`, `thumbnail`, `fileName`, `fileMeta`, `progress`, `message`, `footer`, `basic` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

`choose()` opens the file dialog, `upload()` sends the waiting files, `clear()` removes them (and stops a running request), `clearUploaded()` empties the list of uploaded files; `entries()` and `uploadedEntries()` read the files with their status and progress, `uploading()` tells whether a request runs.

## Outputs
| Name | Description |
|---|---|
| filesChange | The picked files changed |
| fileChange | The picked file changed (without `multiple`) |
| selected | Files were added: `{ originalEvent, files, currentFiles }` |
| rejected | Files were not added: `[{ file, reason: 'type' \| 'size' \| 'limit', message }]` |
| removed | A waiting file was removed: `{ originalEvent, file }` |
| cleared | Clear removed the waiting files |
| beforeUpload | The `FormData` before the files are added; append more fields here |
| uploadProgress | `{ progress }` in percent |
| uploaded | Files were uploaded: `{ originalEvent, files }` |
| uploadFailed | The upload failed: `{ files, error }` |
| uploadHandler | `customUpload`: `{ files, progress, complete, fail }` |
| uploadedFileRemoved | An uploaded file was removed from the list: `{ file, files }` |

## Slots
| Name | Description |
|---|---|
| txFileUploadFile | `<ng-template txFileUploadFile let-entry let-remove="remove">` — own file row (`entry.file`, `status`, `progress`, `preview`, `kind`) |
| txFileUploadDropzone | `<ng-template txFileUploadDropzone let-dragging let-choose="choose">` — own content of the empty drop zone |
| txFileUploadActions | Content at the start of the footer, next to Clear and Upload |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves to the drop zone, then to the buttons of the files |
| Enter / Space | On the drop zone: opens the file dialog |
| Enter / Space | On a button: replaces, removes, retries or uploads |
