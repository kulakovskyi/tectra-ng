# Avatar editor

A large avatar the person can change themselves: the camera button picks a photo, or opens a menu with "Change photo" and "Remove" once there is one. Removing asks first in a confirm dialog. Dropping an image file on the photo works too. The editor only reports the chosen file (`photoChange`, `null` after removing); upload it and set `image` to the new address, with `loading` on meanwhile.

```html
<tx-avatar-editor
  [image]="user.photo"
  [name]="user.name"
  [loading]="saving()"
  hint="JPG or PNG, up to 2 MB"
  [maxFileSize]="2 * 1024 * 1024"
  (photoChange)="save($event)"
  (rejected)="warn($event)"
/>
```

## Inputs
| Name | Description |
|---|---|
| image | Two-way: the photo address; without it the avatar shows initials and the button uploads at once |
| name | Name for the initials and the colour when there is no photo |
| size | Size of the photo in px (112 by default, `editor.size` token) |
| loading | Spinner over the photo while the new one uploads; the button is off |
| disabled | Turns the button and drop off |
| hint | Small text under the photo, e.g. allowed types and size |
| accept | File types the picker offers and the editor takes, as in `<input type="file">` (`image/*` by default) |
| maxFileSize | Largest file in bytes; a bigger one emits `rejected` |
| confirmRemove | Ask in a confirm dialog before removing (on by default) |
| changeLabel | Text of "Change photo" (button tooltip and menu item) |
| removeLabel | Text of "Remove" (menu item and the confirm button) |
| removeTitle | Title of the confirm dialog |
| removeMessage | Text of the confirm dialog |
| dt | Design tokens (`avatar`, the `editor` group) |
| pt | Classes and styles of the parts: `root`, `photo`, `badge`, `loader`, `hint` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Drops the tectra styles, keeps the behaviour |

## Outputs
| Name | Description |
|---|---|
| photoChange | The chosen file, or `null` after the photo was removed |
| rejected | `{ file, reason }` — the file has the wrong type (`type`) or is too big (`size`) |

## Methods
| Name | Description |
|---|---|
| pick() | Opens the file picker |
| remove() | Removes the photo (asks first when `confirmRemove`) |

## Keyboard
| Key | Action |
|---|---|
| Tab | Focuses the camera button |
| Enter / Space | Opens the file picker, or the menu when there is a photo |
| Arrow Down / Up, Enter, Escape | Move through, pick or close the menu |
