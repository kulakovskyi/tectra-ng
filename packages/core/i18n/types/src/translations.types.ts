/** Every text the kit shows or announces: labels, hints, validation errors and screen reader names; `{name}` marks a parameter. */
export interface TxTranslations {
  /** Text of an empty select, tree, tree select, cascade select, listbox, table or data view panel. */
  emptyMessage: string;
  /** Placeholder of the search field in select-like panels. */
  searchPlaceholder: string;
  /** Accessible name and tooltip of the clear button of inputs, selects, the date picker, the number input, the password field and the rating. */
  clear: string;
  /** Label of the select-all checkbox of multiselect panels, checkbox groups and table headers. */
  selectAll: string;
  /** Accessible name of the close button of dialogs, popovers, toasts, messages, the image preview, the gallery and file upload messages. */
  close: string;
  /** Accessible name of spinners, progress bars and loading icons, and the loading text of autocomplete, listbox and mention lists. */
  loading: string;
  /** Label of the today button of the date picker and the today marker of the month calendar. */
  today: string;
  /** Label of the previous-page button of the paginator. */
  previousPage: string;
  /** Label of the next-page button of the paginator. */
  nextPage: string;
  /** Accessible name of the copy button of the copy input, truncated text and tags. */
  copy: string;
  /** Accessible name a copy button gets right after copying, in the copy input, truncated text, links and tags. */
  copied: string;
  /** Error shown for an empty required field. */
  validationRequired: string;
  /** Error shown for an invalid email address. */
  validationEmail: string;
  /** Error for a value shorter than allowed; takes `{requiredLength}`. */
  validationMinlength: string;
  /** Error for a value longer than allowed; takes `{requiredLength}`. */
  validationMaxlength: string;
  /** Error for a number below the minimum; takes `{min}`. */
  validationMin: string;
  /** Error for a number above the maximum; takes `{max}`. */
  validationMax: string;
  /** Error shown when a value does not match the required pattern. */
  validationPattern: string;
  /** Fallback error for an invalid value without a more specific message. */
  validationInvalid: string;
  /** Hint of the password strength meter while the field is empty. */
  passwordPrompt: string;
  /** Strength label of a weak password in the password field. */
  passwordWeak: string;
  /** Strength label of a medium password in the password field. */
  passwordMedium: string;
  /** Strength label of a strong password in the password field. */
  passwordStrong: string;
  /** Label of the button that reveals the password. */
  showPassword: string;
  /** Label of the button that hides the password. */
  hidePassword: string;
  /** Accessible name of one cell of the one-time code input; takes `{index}` and `{length}`. */
  otpCell: string;
  /** Accessible name of the increase button of the number input. */
  increment: string;
  /** Accessible name of the decrease button of the number input. */
  decrement: string;
  /** Value text of the rating for screen readers; takes `{value}` and `{stars}`. */
  ratingValue: string;
  /** Added to the accessible name of the first thumb of a range slider. */
  rangeStart: string;
  /** Added to the accessible name of the second thumb of a range slider. */
  rangeEnd: string;
  /** Accessible name of the remove button of chips, pills and tags, and the remove action of a file upload row. */
  remove: string;
  /** Overflow counter of an avatar group, tag list or chips input; takes `{count}`. */
  moreItems: string;
  /** Label of the change-photo action of the avatar uploader. */
  avatarChangePhoto: string;
  /** Label of the upload-photo action of the avatar uploader when there is no photo. */
  avatarUploadPhoto: string;
  /** Label of the remove-photo action of the avatar uploader. */
  avatarRemovePhoto: string;
  /** Title of the confirmation shown before an avatar photo is deleted. */
  avatarRemoveTitle: string;
  /** Message of the confirmation shown before an avatar photo is deleted. */
  avatarRemoveMessage: string;
  /** Accessible name of the avatar photo action menu. */
  avatarPhotoActions: string;
  /** Accessible name of the popover that lists the tags hidden behind the overflow counter. */
  tagListHidden: string;
  /** Summary of a multi-select with many chosen values; takes `{count}`. */
  selectedItems: string;
  /** Summary of selected items out of all options; takes `{selected}` and `{total}`. */
  selectedOfTotal: string;
  /** Accessible name of the button that opens the options panel of select-like components. */
  showOptions: string;
  /** Accessible name of the remove button of one chosen file or chip; takes `{item}`. */
  removeItem: string;
  /** Accessible name of the color picker trigger. */
  pickColor: string;
  /** Text of the color picker trigger while no color is chosen. */
  noColor: string;
  /** Accessible name of the saturation and brightness area of the color picker. */
  colorArea: string;
  /** Value text of the color area; takes `{saturation}` and `{brightness}`. */
  colorAreaValue: string;
  /** Accessible name of the hue slider of the color picker. */
  colorHue: string;
  /** Accessible name of the hex input of the color picker. */
  colorHex: string;
  /** Accessible name of the preset swatches of the color picker. */
  colorPresets: string;
  /** Label of the suggested-address button in the email field; takes `{email}`. */
  useEmail: string;
  /** Typo hint of the email field; takes `{email}`. */
  didYouMean: string;
  /** Label of the yes option of the table boolean filter, the status icon and boolean cells in exports. */
  yes: string;
  /** Label of the no option of the table boolean filter, the status icon and boolean cells in exports. */
  no: string;
  /** Label of the copy-link button. */
  copyLink: string;
  /** Default label of the export button and menu. */
  export: string;
  /** Accessible name of the export format menu. */
  exportFormats: string;
  /** Menu item that exports the table to CSV. */
  exportCsv: string;
  /** Menu item that exports the table to Excel. */
  exportExcel: string;
  /** Menu item that exports the table to Word. */
  exportWord: string;
  /** Menu item that exports the table to PDF. */
  exportPdf: string;
  /** Menu item that exports the table to JSON. */
  exportJson: string;
  /** Menu item that exports the table to HTML. */
  exportHtml: string;
  /** Menu item that exports the table to Markdown. */
  exportMarkdown: string;
  /** Menu item that copies the table to the clipboard. */
  exportCopy: string;
  /** Message shown after the table was copied. */
  exportCopied: string;
  /** Menu item that prints the table. */
  exportPrint: string;
  /** Accessible name of the date picker trigger button. */
  chooseDate: string;
  /** Accessible name of the previous-month button of the calendar. */
  previousMonth: string;
  /** Accessible name of the next-month button of the calendar. */
  nextMonth: string;
  /** Accessible name of the previous-year button of the calendar. */
  previousYear: string;
  /** Accessible name of the next-year button of the calendar. */
  nextYear: string;
  /** Accessible name of the previous-decade button of the calendar year view. */
  previousDecade: string;
  /** Accessible name of the next-decade button of the calendar year view. */
  nextDecade: string;
  /** Accessible name of the button that opens the month view of the calendar. */
  chooseMonth: string;
  /** Accessible name of the button that opens the year view of the calendar. */
  chooseYear: string;
  /** Short header of the week-number column of the calendar. */
  weekHeader: string;
  /** Label of the morning period in 12-hour time pickers. */
  am: string;
  /** Label of the afternoon period in 12-hour time pickers. */
  pm: string;
  /** Accessible name of the hour group of the date picker time panel. */
  hour: string;
  /** Accessible name of the minute group of the date picker time panel. */
  minute: string;
  /** Accessible name of the second group of the date picker time panel. */
  second: string;
  /** Accessible name of the increase-hour button of time pickers. */
  nextHour: string;
  /** Accessible name of the decrease-hour button of time pickers. */
  previousHour: string;
  /** Accessible name of the increase-minute button of time pickers. */
  nextMinute: string;
  /** Accessible name of the decrease-minute button of time pickers. */
  previousMinute: string;
  /** Accessible name of the increase-second button of time pickers. */
  nextSecond: string;
  /** Accessible name of the decrease-second button of time pickers. */
  previousSecond: string;
  /** Accessible name of the AM / PM switch of time pickers. */
  toggleAmPm: string;
  /** Announcement of a chosen calendar date; takes `{date}`. */
  dateSelected: string;
  /** Accessible name of the date picker calendar and of the month calendar region. */
  calendar: string;
  /** Overflow counter of a month calendar day with more events than fit; takes `{count}`. */
  moreEvents: string;
  /** Screen reader text of the number of events of a day in the month calendar; takes `{count}`. */
  events: string;
  /** Label of the copy button of an email address. */
  copyEmail: string;
  /** Label of the copy button of a phone number. */
  copyPhone: string;
  /** Hidden text added to links that open in a new tab. */
  opensInNewTab: string;
  /** Accessible name of the breadcrumb navigation. */
  breadcrumb: string;
  /** Hidden text added to a completed step of the stepper. */
  stepCompleted: string;
  /** Accessible name of the menubar and the app layout menu, and the toggle label of a console layout panel. */
  menu: string;
  /** Accessible name of the splitter handle between panels. */
  resizePanels: string;
  /** Accessible name of the image preview overlay. */
  imagePreview: string;
  /** Label of the preview trigger over an image. */
  zoomImage: string;
  /** Label of the rotate-right button of the image preview. */
  rotateRight: string;
  /** Label of the rotate-left button of the image preview. */
  rotateLeft: string;
  /** Label of the zoom-in button of the image preview. */
  zoomIn: string;
  /** Label of the zoom-out button of the image preview. */
  zoomOut: string;
  /** Accessible name of the carousel. */
  carousel: string;
  /** Role description of one carousel or gallery slide for screen readers. */
  slide: string;
  /** Position text of a carousel or gallery slide; takes `{index}` and `{total}`. */
  slideOf: string;
  /** Accessible name of the previous-slide button of the carousel. */
  previousSlide: string;
  /** Accessible name of the next-slide button of the carousel. */
  nextSlide: string;
  /** Accessible name of the image gallery. */
  gallery: string;
  /** Accessible name of one gallery image; takes `{index}`. */
  galleryImage: string;
  /** Accessible name of the previous-image button of the gallery. */
  previousImage: string;
  /** Accessible name of the next-image button of the gallery. */
  nextImage: string;
  /** Accessible name of the thumbnail strip of the gallery. */
  thumbnails: string;
  /** Accessible name of the button that scrolls the thumbnail strip back. */
  previousThumbnails: string;
  /** Accessible name of the button that scrolls the thumbnail strip forward. */
  nextThumbnails: string;
  /** Drop zone prompt of the multi-file upload; takes `{browse}`, the link text. */
  fileUploadPrompt: string;
  /** Drop zone prompt of the single-file upload; takes `{browse}`, the link text. */
  fileUploadPromptSingle: string;
  /** Link text that opens the file dialog, substituted into the drop zone prompt. */
  fileUploadBrowse: string;
  /** Drop zone text shown while files are dragged over it. */
  fileUploadRelease: string;
  /** Label of the button that opens the dialog to choose one file. */
  chooseFile: string;
  /** Label of the button that opens the dialog to choose files. */
  chooseFiles: string;
  /** Label of the upload button of file upload. */
  upload: string;
  /** Label of the replace button of a file upload row. */
  replace: string;
  /** Label of the button that retries a failed upload. */
  retry: string;
  /** Accessible name of the rich text editor. */
  editorLabel: string;
  /** Accessible name of the editor formatting toolbar. */
  editorToolbar: string;
  /** Label of the undo button of the editor. */
  editorUndo: string;
  /** Label of the redo button of the editor. */
  editorRedo: string;
  /** Label of the text style dropdown of the editor. */
  editorTextStyle: string;
  /** Text style option for a normal paragraph in the editor. */
  editorParagraph: string;
  /** Text style option for a heading in the editor; takes `{level}`. */
  editorHeading: string;
  /** Label of the bold button of the editor. */
  editorBold: string;
  /** Label of the italic button of the editor. */
  editorItalic: string;
  /** Label of the underline button of the editor. */
  editorUnderline: string;
  /** Label of the strikethrough button of the editor. */
  editorStrike: string;
  /** Label of the inline code button of the editor. */
  editorCode: string;
  /** Label of the subscript button of the editor. */
  editorSubscript: string;
  /** Label of the superscript button of the editor. */
  editorSuperscript: string;
  /** Label of the text color control of the editor. */
  editorTextColor: string;
  /** Label of the highlight color control of the editor. */
  editorHighlight: string;
  /** Label of the reset-to-default swatch in the editor color menus. */
  editorDefaultColor: string;
  /** Label of the text size dropdown of the editor. */
  editorFontSize: string;
  /** Small option of the editor text size menu. */
  editorSizeSmall: string;
  /** Normal option of the editor text size menu. */
  editorSizeNormal: string;
  /** Large option of the editor text size menu. */
  editorSizeLarge: string;
  /** Huge option of the editor text size menu. */
  editorSizeHuge: string;
  /** Label of the bulleted list button of the editor. */
  editorBulletList: string;
  /** Label of the numbered list button of the editor. */
  editorOrderedList: string;
  /** Label of the checklist button and slash item of the editor, and accessible name of a checklist item checkbox. */
  editorTaskList: string;
  /** Label of the increase-indent button of the editor. */
  editorIndent: string;
  /** Label of the decrease-indent button of the editor. */
  editorOutdent: string;
  /** Label of the alignment dropdown of the editor. */
  editorAlign: string;
  /** Label of the align-left option of the editor. */
  editorAlignLeft: string;
  /** Label of the align-center option of the editor. */
  editorAlignCenter: string;
  /** Label of the align-right option of the editor. */
  editorAlignRight: string;
  /** Label of the justify option of the editor. */
  editorAlignJustify: string;
  /** Label of the link button of the editor. */
  editorLink: string;
  /** Label of the address field of the editor link popover. */
  editorLinkUrl: string;
  /** Label of the apply button of the editor link popover. */
  editorLinkApply: string;
  /** Label of the remove-link button of the editor. */
  editorLinkRemove: string;
  /** Label of the edit-link button of the editor link bubble. */
  editorLinkEdit: string;
  /** Label of the image button of the editor. */
  editorImage: string;
  /** Label of the video button of the editor. */
  editorVideo: string;
  /** Label of the address field of the editor video popover. */
  editorVideoUrl: string;
  /** Hint under the video address field of the editor. */
  editorVideoHint: string;
  /** Label of the submit button of the editor video popover. */
  editorInsert: string;
  /** Label of the quote button of the editor. */
  editorQuote: string;
  /** Label of the code block button of the editor. */
  editorCodeBlock: string;
  /** Label of the divider button of the editor. */
  editorRule: string;
  /** Label of the clear-formatting button of the editor. */
  editorClear: string;
  /** Label of the button that expands the editor to full view. */
  editorFullView: string;
  /** Label of the button that leaves the editor full view. */
  editorNormalView: string;
  /** Label of the AI improve button of the editor. */
  editorAi: string;
  /** Character counter of the editor; takes `{count}`. */
  editorCount: string;
  /** Character counter of the editor with a limit; takes `{count}` and `{limit}`. */
  editorCountLimit: string;
  /** Empty text of the editor slash, emoji and mention suggestion list. */
  editorNoMatches: string;
  /** Error shown when an image added to the editor is too big; takes `{name}` and `{size}`. */
  editorImageTooLarge: string;
  /** Name of the gray swatch in the editor color menus. */
  editorColorGray: string;
  /** Name of the red swatch in the editor color menus. */
  editorColorRed: string;
  /** Name of the orange swatch in the editor color menus. */
  editorColorOrange: string;
  /** Name of the yellow swatch in the editor color menus. */
  editorColorYellow: string;
  /** Name of the green swatch in the editor color menus. */
  editorColorGreen: string;
  /** Name of the teal swatch in the editor color menus. */
  editorColorTeal: string;
  /** Name of the blue swatch in the editor color menus. */
  editorColorBlue: string;
  /** Name of the purple swatch in the editor color menus. */
  editorColorPurple: string;
  /** Name of the pink swatch in the editor color menus. */
  editorColorPink: string;
  /** Header of the image preview dialog of the editor and of rendered editor content. */
  editorImagePreview: string;
  /** Label of the callout button of the editor. */
  editorCallout: string;
  /** Accessible name of the button on a callout that changes its color. */
  editorCalloutTone: string;
  /** Label of the table button of the editor. */
  editorTable: string;
  /** Label of the add-row-above action of the editor table menu. */
  editorRowAbove: string;
  /** Label of the add-row-below action of the editor table menu. */
  editorRowBelow: string;
  /** Label of the add-column-left action of the editor table menu. */
  editorColumnLeft: string;
  /** Label of the add-column-right action of the editor table menu. */
  editorColumnRight: string;
  /** Label of the delete-row action of the editor table menu. */
  editorDeleteRow: string;
  /** Label of the delete-column action of the editor table menu. */
  editorDeleteColumn: string;
  /** Label of the header-row toggle of the editor table menu. */
  editorHeaderRow: string;
  /** Label of the delete-table action of the editor table menu. */
  editorDeleteTable: string;
  /** Accessible name of the editor suggestion list opened by the slash key. */
  editorCommands: string;
  /** Accessible name of the editor suggestion list opened by the emoji trigger. */
  editorEmoji: string;
  /** Accessible name of the editor suggestion list opened by the mention trigger. */
  editorMentions: string;
  /** Label of the button that keeps the AI result in the editor. */
  editorAiKeep: string;
  /** Label of the button that discards the AI result in the editor. */
  editorAiDiscard: string;
  /** Accessible name of the code editor. */
  codeEditorLabel: string;
  /** Accessible name of the static highlighted code block. */
  codeHighlightLabel: string;
  /** Label of the find field of the code editor search panel. */
  codeSearchFind: string;
  /** Label of the replace field and button of the code editor search panel. */
  codeSearchReplace: string;
  /** Label of the replace-all button of the code editor search panel. */
  codeSearchReplaceAll: string;
  /** Label of the next-match button of the code editor search panel. */
  codeSearchNext: string;
  /** Label of the previous-match button of the code editor search panel. */
  codeSearchPrevious: string;
  /** Label of the match-case toggle of the code editor search panel. */
  codeSearchMatchCase: string;
  /** Label of the whole-word toggle of the code editor search panel. */
  codeSearchWholeWord: string;
  /** Label of the regular-expression toggle of the code editor search panel. */
  codeSearchRegexp: string;
  /** Label of the button that shows or hides the replace row of the code editor search panel. */
  codeSearchToggleReplace: string;
  /** Label of the close button of the code editor search panel. */
  codeSearchClose: string;
  /** Match counter of the code editor search panel; takes `{current}` and `{total}`. */
  codeSearchCount: string;
  /** Text of the code editor search panel when nothing matches. */
  codeSearchNoResults: string;
  /** Accessible name of the code diff view. */
  codeDiffLabel: string;
  /** Header of the original side of the code diff view. */
  codeDiffOriginal: string;
  /** Header of the modified side of the code diff view. */
  codeDiffModified: string;
  /** Text of the file input while no file is chosen. */
  noFileChosen: string;
  /** Text of the file input with several files; takes `{count}`. */
  filesChosen: string;
  /** Status of a file waiting for upload in the file upload list. */
  fileReady: string;
  /** Status of a file being uploaded; takes `{progress}`, a percentage. */
  fileUploading: string;
  /** Status of a file that was uploaded. */
  fileUploaded: string;
  /** Status of a file whose upload failed. */
  fileFailed: string;
  /** Error for a file of a type that is not accepted; takes `{name}` and `{types}`. */
  invalidFileType: string;
  /** Error for a file over the size limit; takes `{name}` and `{size}`. */
  invalidFileSize: string;
  /** Error shown when more files than allowed are added; takes `{limit}`. */
  invalidFileLimit: string;
  /** Announcement of added files; takes `{names}`. */
  filesAdded: string;
  /** Announcement shown when every file is uploaded. */
  filesUploaded: string;
  /** Summary line under the file list; takes `{count}` and `{size}`. */
  filesSummary: string;
  /** Accessible name of the toast region. */
  notifications: string;
  /** Label of the accept button of confirmation dialogs. */
  confirm: string;
  /** Label of the reject button of confirmation dialogs and of the pinned tabs dialog. */
  cancel: string;
  /** Label of the accept button of a danger confirmation dialog. */
  delete: string;
  /** Default text of confirmation popups. */
  confirmQuestion: string;
  /** Label of the maximize button of dialogs. */
  maximize: string;
  /** Label of the restore button of maximized dialogs. */
  restore: string;
  /** Accessible name of the overflow button of the actions menu, split button and table actions. */
  moreActions: string;
  /** Accessible name of the first-page button of the paginator. */
  firstPage: string;
  /** Accessible name of the last-page button of the paginator. */
  lastPage: string;
  /** Accessible name of one page button of the paginator and of carousel indicators; takes `{page}`. */
  pageNumber: string;
  /** Label of the page-size select of the paginator. */
  rowsPerPage: string;
  /** Label of the go-to-page field of the paginator. */
  jumpToPage: string;
  /** Current page text of the compact paginator; takes `{currentPage}` and `{totalPages}`. */
  currentPageReport: string;
  /** Total count text of the paginator; takes `{count}`. */
  totalCount: string;
  /** Accessible name of the paginator navigation. */
  pagination: string;
  /** Label of the table settings button. */
  tableSettings: string;
  /** Title of the column visibility section of the table settings. */
  tableColumns: string;
  /** Hint of the column visibility section of the table settings. */
  tableColumnsHint: string;
  /** Header of the table actions column and title of the row actions tab of the table settings. */
  tableActions: string;
  /** Hint of the row actions section of the table settings. */
  tableActionsHint: string;
  /** Accessible name of the row actions menu of a table. */
  rowActions: string;
  /** Accessible name of the actions menu of a tree node. */
  nodeActions: string;
  /** Label of the list option of the layout switch. */
  listView: string;
  /** Label of the grid option of the layout switch. */
  gridView: string;
  /** Accessible name of the list and grid switch of the data view. */
  layout: string;
  /** Accessible name of the row checkbox of a table. */
  selectRow: string;
  /** Accessible name of the button that expands a table row. */
  expandRow: string;
  /** Accessible name of the button that collapses a table row. */
  collapseRow: string;
  /** Accessible name of the column resize handle; takes `{column}`. */
  resizeColumn: string;
  /** Accessible name of the column filter button; takes `{column}`. */
  filterColumn: string;
  /** Label of the value field of a column filter. */
  filterValue: string;
  /** Label of the match mode select of a column filter. */
  filterMatchMode: string;
  /** Option of the table column filter that requires every rule to match; also half of the accessible name of that switch. */
  filterMatchAll: string;
  /** Option of the table column filter that requires any rule to match; also half of the accessible name of that switch. */
  filterMatchAny: string;
  /** Label of the add-rule button of a column filter. */
  filterAddRule: string;
  /** Accessible name of the remove-rule button of a column filter. */
  filterRemoveRule: string;
  /** Label of the apply button of a column filter. */
  filterApply: string;
  /** Option meaning no restriction in filter selects. */
  filterAny: string;
  /** Text match mode of filters: value starts with the input. */
  startsWith: string;
  /** Text match mode of filters: value contains the input. */
  contains: string;
  /** Text match mode of filters: value does not contain the input. */
  notContains: string;
  /** Text match mode of filters: value ends with the input. */
  endsWith: string;
  /** Match mode of filters: value equals the input. */
  equals: string;
  /** Match mode of filters: value differs from the input. */
  notEquals: string;
  /** Match mode of filters: value is one of the chosen options. */
  in: string;
  /** Number match mode of filters: less than. */
  lt: string;
  /** Number match mode of filters: less than or equal to. */
  lte: string;
  /** Number match mode of filters: greater than. */
  gt: string;
  /** Number match mode of filters: greater than or equal to. */
  gte: string;
  /** Number match mode of filters: inside a range. */
  between: string;
  /** Date match mode of filters: the same day. */
  dateIs: string;
  /** Date match mode of filters: any other day. */
  dateIsNot: string;
  /** Date match mode of filters: earlier than the date. */
  dateBefore: string;
  /** Date match mode of filters: later than the date. */
  dateAfter: string;
  /** Accessible name of the button that starts editing a table row. */
  editRow: string;
  /** Accessible name of the button that saves an edited table row. */
  saveRow: string;
  /** Accessible name of the button that cancels editing a table row. */
  cancelEdit: string;
  /** Accessible name of the drag handle that reorders a table row. */
  moveRow: string;
  /** Count shown in a table row group header; takes `{count}`. */
  rowGroup: string;
  /** Title and tooltip of the filters panel. */
  filters: string;
  /** Label of the button that clears every filter. */
  clearFilters: string;
  /** Label of the button that shows hidden filters. */
  showFilters: string;
  /** Tooltip of a filter that stays visible because it holds a value. */
  filterHasValue: string;
  /** Label of the button that restores the default filter layout. */
  resetFiltersLayout: string;
  /** Tooltip of the drag handle that reorders filters. */
  reorderFilter: string;
  /** Counter of visible filters in the filter settings; takes `{shown}` and `{total}`. */
  filtersShown: string;
  /** Accessible name of the filter bar with hidden filters; takes `{label}` and `{count}`. */
  filtersHidden: string;
  /** Default accessible name of the navigation of the app footer. */
  legal: string;
  /** Default accessible name of the section rail of the console layout. */
  consoleSections: string;
  /** Accessible name of the app layout button that keeps the menu open. */
  pinMenu: string;
  /** Accessible name of the app layout button that lets the menu fold. */
  unpinMenu: string;
  /** Label of the next button of the wizard. */
  wizardNext: string;
  /** Label of the back button of the wizard. */
  wizardBack: string;
  /** Default accessible name of the wizard progress list. */
  wizardProgress: string;
  /** Accessible name, tooltip and label of the button of pinned tabs that opens the customization dialog. */
  customize: string;
  /** Title and group name of the pinned tabs customization dialog. */
  pinnedTabs: string;
  /** Hint text of the pinned tabs customization dialog. */
  pinnedTabsHint: string;
  /** Counter of chosen tabs in the pinned tabs dialog; takes `{count}` and `{total}`. */
  pinnedSelected: string;
  /** Label of the first pinned tab that shows everything. */
  all: string;
  /** Label of the save button of the pinned tabs dialog. */
  save: string;
  /** Label and accessible name of the command palette trigger, its field and its list. */
  search: string;
  /** Text shown while search results load. */
  searching: string;
  /** Text of the command palette and search lists when nothing matches. */
  nothingFound: string;
  /** Keyboard hint of the command palette footer for the arrow keys. */
  paletteNavigate: string;
  /** Keyboard hint of the command palette footer for the enter key. */
  paletteOpen: string;
  /** Keyboard hint of the command palette footer for the escape key. */
  paletteClose: string;
  /** Accessible name of the kanban board. */
  board: string;
  /** Accessible name of the drag handle that moves a kanban column. */
  moveColumn: string;
  /** Text of an empty kanban column. */
  noCards: string;
  /** Label of the button that reveals more kanban cards; takes `{count}`. */
  showMore: string;
  /** Accessible description of a kanban card with the keyboard hint. */
  kanbanMoveHint: string;
  /** Announcement after a kanban card moved; takes `{column}` and `{position}`. */
  kanbanMoved: string;
  /** Label of the theme switch while the theme is dark. */
  switchToLight: string;
  /** Label of the theme switch while the theme is light. */
  switchToDark: string;
  /** Label of the language switcher and of the language row of topbar preferences. */
  language: string;
  /** Label of the theme row of topbar preferences. */
  theme: string;
  /** Label of the primary color swatches of the theme configurator. */
  themePrimary: string;
  /** Label of the surface palette swatches of the theme configurator. */
  themeSurface: string;
  /** Label of the style buttons of the theme configurator. */
  themeStyle: string;
  /** Label of the ripple switch of the theme configurator. */
  themeRipple: string;
  /** Accessible name of the button that opens the navigation menu. */
  openMenu: string;
  /** Accessible name of the button that closes the navigation menu. */
  closeMenu: string;
  /** Title of the cookie notice. */
  cookieTitle: string;
  /** Body text of the cookie notice. */
  cookieText: string;
  /** Link text of the cookie notice. */
  cookieLearnMore: string;
  /** Label of the accept button of the cookie notice. */
  cookieAccept: string;
  /** Accessible name of the cookie notice region. */
  cookieLabel: string;
  /** Message of the connection banner while the browser is offline. */
  offline: string;
  /** Message of the connection banner after the browser is online again. */
  connectionRestored: string;
  /** Accessible name of the QR code image. */
  qrCode: string;
  /** Text shown when a QR code cannot be rendered. */
  qrCodeError: string;
  /** Label of the add button of an avatar group. */
  addPerson: string;
  /** Placeholder of the list input. */
  listInputPlaceholder: string;
  /** Placeholder of the list input in domain mode. */
  listInputPlaceholderDomain: string;
  /** Placeholder of the list input in email mode. */
  listInputPlaceholderEmail: string;
  /** Placeholder of the list input in link mode. */
  listInputPlaceholderUrl: string;
  /** Hint under the list input. */
  listInputHint: string;
  /** Hint under the list input in domain mode. */
  listInputHintDomain: string;
  /** Hint under the list input in email mode. */
  listInputHintEmail: string;
  /** Hint under the list input in link mode. */
  listInputHintUrl: string;
  /** Plural counter of parsed items in the list input; takes `{count}`. */
  listInputItems: string;
  /** Plural counter of parsed domains in the list input; takes `{count}`. */
  listInputDomains: string;
  /** Plural counter of parsed emails in the list input; takes `{count}`. */
  listInputEmails: string;
  /** Plural counter of parsed links in the list input; takes `{count}`. */
  listInputUrls: string;
  /** Plural counter of duplicates found by the list input; takes `{count}`. */
  listInputDuplicates: string;
  /** Counter of lines the list input did not recognize; takes `{count}`. */
  listInputInvalidCount: string;
  /** Label of the group of unrecognized lines in the list input. */
  listInputInvalid: string;
  /** Overflow counter of the list input preview; takes `{count}`. */
  listInputMore: string;
  /** Label of the clean-up button of the list input. */
  listInputCleanUp: string;
  /** Tooltip of the clean-up button of the list input. */
  listInputCleanUpHint: string;
  /** Text of a chart without data. */
  chartNoData: string;
  /** Text of a chart while data loads. */
  chartLoading: string;
  /** Accessible name of the chart legend. */
  chartLegend: string;
  /** Accessible name of the hidden data table of a chart. */
  chartDataTable: string;
  /** Category column header of the chart data table and tooltip. */
  chartCategory: string;
  /** Value column header of the chart data table and tooltip. */
  chartValue: string;
  /** Share of total in chart tooltips and the data table. */
  chartShare: string;
  /** Total label of charts. */
  chartTotal: string;
  /** Screen reader summary of a chart; takes `{type}`, `{series}` and `{points}`. */
  chartSummary: string;
  /** Screen reader range text of a chart axis; takes `{min}` and `{max}`. */
  chartRange: string;
  /** Screen reader text of one chart value; takes `{series}`, `{category}` and `{value}`. */
  chartPoint: string;
  /** Keyboard hint of charts. */
  chartNavigateHint: string;
  /** Chart type name of the line chart. */
  chartLine: string;
  /** Chart type name of the area chart. */
  chartArea: string;
  /** Chart type name of the column chart. */
  chartColumn: string;
  /** Chart type name of the bar chart. */
  chartBar: string;
  /** Chart type name of the combo chart. */
  chartCombo: string;
  /** Chart type name of the scatter chart. */
  chartScatter: string;
  /** Chart type name of the bubble chart. */
  chartBubble: string;
  /** Default label of the bubble size value in bubble chart tooltips. */
  chartSize: string;
  /** Chart type name of the radar chart. */
  chartRadar: string;
  /** Caption of the average in radar chart tooltips. */
  chartAverage: string;
  /** Chart type name of the radial bar chart. */
  chartRadialBar: string;
  /** Chart type name of the gauge. */
  chartGauge: string;
  /** Chart type name of the waterfall chart. */
  chartWaterfall: string;
  /** Chart type name of the funnel chart. */
  chartFunnel: string;
  /** Chart type name of the bullet chart. */
  chartBullet: string;
  /** Label of a rising step in waterfall charts. */
  chartIncrease: string;
  /** Label of a falling step in waterfall charts. */
  chartDecrease: string;
  /** Label of the change value in waterfall chart tooltips. */
  chartChange: string;
  /** Label of the step conversion rate in funnel chart tooltips. */
  chartConversion: string;
  /** Label of the share of the first stage in funnel chart tooltips. */
  chartOfFirst: string;
  /** Label of the target value in bullet chart tooltips. */
  chartTarget: string;
  /** Chart type name of the candlestick chart. */
  chartCandlestick: string;
  /** Chart type name of the box plot. */
  chartBoxplot: string;
  /** Chart type name of the range area chart. */
  chartRangeArea: string;
  /** Label of the opening price in candlestick tooltips. */
  chartOpen: string;
  /** Label of the highest price in candlestick tooltips. */
  chartHigh: string;
  /** Label of the lowest price in candlestick tooltips. */
  chartLow: string;
  /** Label of the closing price in candlestick tooltips. */
  chartClose: string;
  /** Label of the trade volume in candlestick tooltips. */
  chartVolume: string;
  /** Label of the minimum in box plot and range tooltips. */
  chartMin: string;
  /** Label of the maximum in box plot and range tooltips. */
  chartMax: string;
  /** Label of the median in box plot tooltips. */
  chartMedian: string;
  /** Label of the first quartile in box plot tooltips. */
  chartQ1: string;
  /** Label of the third quartile in box plot tooltips. */
  chartQ3: string;
  /** Label of the outliers in box plot tooltips. */
  chartOutliers: string;
  /** Chart type name of the Gantt chart. */
  chartGantt: string;
  /** Plural count of tasks in the Gantt chart summary; takes `{count}`. */
  chartSummaryTasks: string;
  /** Corner header of the task column of the Gantt chart. */
  chartTask: string;
  /** Plural duration in days in Gantt chart tooltips; takes `{count}`. */
  chartDays: string;
  /** Label of the task progress in Gantt chart tooltips. */
  chartProgress: string;
  /** Label of a milestone in Gantt charts. */
  chartMilestone: string;
  /** Day option of the Gantt zoom control. */
  chartZoomDay: string;
  /** Week option of the Gantt zoom control. */
  chartZoomWeek: string;
  /** Month option of the Gantt zoom control. */
  chartZoomMonth: string;
  /** Quarter option of the Gantt zoom control. */
  chartZoomQuarter: string;
  /** Corner header of the Gantt chart in the timeline layout. */
  chartTimeline: string;
  /** Chart type name of the Sankey diagram. */
  chartSankey: string;
  /** Chart type name of the sunburst chart. */
  chartSunburst: string;
  /** Screen reader and tooltip name of one Sankey flow; takes `{source}` and `{target}`. */
  chartFlow: string;
  /** Label of the incoming flow total in Sankey tooltips. */
  chartIncoming: string;
  /** Label of the outgoing flow total in Sankey tooltips. */
  chartOutgoing: string;
  /** Label of the share of the parent in sunburst tooltips. */
  chartOfParent: string;
  /** Label of the share of the whole in sunburst and treemap tooltips. */
  chartOfTotal: string;
  /** Plural count of flows in the Sankey summary; takes `{count}`. */
  chartFlows: string;
  /** Label of the button that resets chart zoom. */
  chartResetZoom: string;
  /** Pointer and keyboard hint of zoomable charts. */
  chartZoomHint: string;
  /** Keyboard and pointer hint of the Gantt chart. */
  chartGanttHint: string;
  /** Screen reader text of the gauge value; takes `{value}`, `{min}` and `{max}`. */
  chartGaugeValue: string;
  /** Chart type name of the pie chart. */
  chartPie: string;
  /** Chart type name of the donut chart. */
  chartDonut: string;
  /** Accessible name of the chart download menu button and popover. */
  chartMenu: string;
  /** Menu item that downloads the chart as SVG. */
  chartDownloadSvg: string;
  /** Menu item that downloads the chart as PNG. */
  chartDownloadPng: string;
  /** Menu item that downloads the chart data as CSV. */
  chartDownloadCsv: string;
  /** Chart type name of the heatmap. */
  chartHeatmap: string;
  /** Chart type name of the treemap. */
  chartTreemap: string;
  /** Chart type name of the rank line chart, used in its screen reader summary. */
  chartRank: string;
  /** Default label of the rank column in the rank line chart data table and announcements. */
  chartRankValue: string;
  /** Accessible name of the org chart. */
  orgChartTitle: string;
  /** Pointer and keyboard hint of the org chart. */
  orgChartHint: string;
  /** Label of the search field of the org chart. */
  orgChartSearch: string;
  /** Counter of org chart search matches; takes `{count}`. */
  orgChartMatches: string;
  /** Text of the org chart search without matches. */
  orgChartNoMatches: string;
  /** Label of the zoom-in button of the org chart. */
  orgChartZoomIn: string;
  /** Label of the zoom-out button of the org chart. */
  orgChartZoomOut: string;
  /** Label of the reset-zoom button of the org chart. */
  orgChartResetZoom: string;
  /** Label of the fit-to-screen button of the org chart. */
  orgChartFit: string;
  /** Label of the expand-all button of the org chart. */
  orgChartExpandAll: string;
  /** Label of the collapse-all button of the org chart. */
  orgChartCollapseAll: string;
  /** Label of the full screen button of the org chart. */
  orgChartFullscreen: string;
  /** Label of the button that leaves the full screen of the org chart. */
  orgChartExitFullscreen: string;
  /** Accessible name of the button that expands an org chart node. */
  orgChartExpand: string;
  /** Accessible name of the button that collapses an org chart node. */
  orgChartCollapse: string;
  /** Accessible name of the org chart toolbar overflow menu. */
  orgChartMore: string;
  /** Label of the success class of the HTTP status tag (2xx). */
  httpStatusOk: string;
  /** Label of the redirect class of the HTTP status tag (3xx). */
  httpStatusRedirect: string;
  /** Label of the client error class of the HTTP status tag (4xx). */
  httpStatusClientError: string;
  /** Label of the server error class of the HTTP status tag (5xx). */
  httpStatusServerError: string;
  /** Label of the warning class of the HTTP status tag. */
  httpStatusWarning: string;
  /** Label of the HTTP status tag when there was no response. */
  httpStatusNoResponse: string;
  /** Label of the HTTP status tag for an unknown code. */
  httpStatusUnknown: string;
  /** Error for a verification code of the wrong length; takes `{length}`. */
  validationCodeFormat: string;
  /** Error for an invalid date. */
  validationDate: string;
  /** Error for a date that is not in the future. */
  validationPastDate: string;
  /** Error for an invalid link. */
  validationUrl: string;
  /** Error for a weak password; takes `{minLength}`. */
  validationWeakPassword: string;
  /** Error when two fields do not match. */
  validationMismatch: string;
  /** Error when the repeated password differs. */
  validationPasswordMismatch: string;
  /** Error when two fields must differ but are equal. */
  validationDistinct: string;
  /** Error for an invalid IP address. */
  validationIp: string;
  /** Error for an invalid domain. */
  validationDomain: string;
  /** Error for a value that already exists. */
  validationDuplicate: string;
  /** Error for a time that is not in the `HH:mm` format. */
  validationTime: string;
  /** Error for text that is not a valid JSON object. */
  validationJson: string;
  /** Error of a confirmation field that does not equal the expected text; takes `{expected}`. */
  validationValueMismatch: string;
  /** Error when a total goes over its maximum; takes `{max}`. */
  validationSumExceeded: string;
  /** Error for a price in the wrong format. */
  validationPriceFormat: string;
  /** Error for a price that is not above zero. */
  validationPricePositive: string;
  /** Toast shown after text was copied to the clipboard. */
  copiedToClipboard: string;
  /** Toast shown when copying to the clipboard failed. */
  copyToClipboardFailed: string;
}

/** One locale: its code, `Intl` tag, week start, date format and the translations. */
export interface TxLocaleDefinition {
  /** Locale code, e.g. `'us'`. */
  code: string;
  /** BCP 47 tag passed to `Intl` for numbers, dates and plurals, e.g. `'en-US'`. */
  intl: string;
  /** First day of the week: `0` is Sunday, `1` is Monday. */
  firstDayOfWeek: 0 | 1;
  /** Date pattern of the date picker, e.g. `'mm/dd/yy'`. */
  dateFormat?: string;
  /** All texts of the locale. */
  translations: TxTranslations;
}

/** Locale code: `'us'` and `'ua'` are built in, any other string is loaded from the locale registry. */
export type TxLocaleCode = 'us' | 'ua' | (string & {});
