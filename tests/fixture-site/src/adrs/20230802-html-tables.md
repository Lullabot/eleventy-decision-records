---
date: 2023-08-02
status: accepted
practiceArea: Design
topics:
  - lorem
  - dolor
contributors:
  - Magna Aliqua

title: HTML tables small and large
context: Checks that raw HTML tables in a record stay readable, from a compact comparison to a wide table that overflows narrow screens.
---

## Small table

<table>
  <thead>
    <tr>
      <th>Environment</th>
      <th>Indicator colour</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Local</td>
      <td>Green</td>
    </tr>
    <tr>
      <td>Staging</td>
      <td>Orange</td>
    </tr>
    <tr>
      <td>Production</td>
      <td>Red</td>
    </tr>
  </tbody>
</table>

## Large table

<table>
  <caption>Lorem ipsum options compared across every environment</caption>
  <thead>
    <tr>
      <th scope="col">Option</th>
      <th scope="col">Local</th>
      <th scope="col">Development</th>
      <th scope="col">Staging</th>
      <th scope="col">Production</th>
      <th scope="col">Cost</th>
      <th scope="col">Maintenance</th>
      <th scope="col">Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Lorem ipsum</th>
      <td>Enabled</td>
      <td>Enabled</td>
      <td>Enabled</td>
      <td>Disabled</td>
      <td>Free</td>
      <td>Low</td>
      <td>Consectetur adipiscing elit, sed do eiusmod tempor incididunt.</td>
    </tr>
    <tr>
      <th scope="row">Dolor sit amet</th>
      <td>Enabled</td>
      <td>Enabled</td>
      <td>Disabled</td>
      <td>Disabled</td>
      <td>$10 per month</td>
      <td>Medium</td>
      <td>Ut enim ad minim veniam, quis nostrud <code>exercitation</code>.</td>
    </tr>
    <tr>
      <th scope="row">Consectetur</th>
      <td>Disabled</td>
      <td>Enabled</td>
      <td>Enabled</td>
      <td>Enabled</td>
      <td>$250 per month</td>
      <td>High</td>
      <td>Duis aute irure dolor in <a href="https://www.lullabot.com/">reprehenderit</a>.</td>
    </tr>
    <tr>
      <th scope="row">Adipiscing elit</th>
      <td>Enabled</td>
      <td>Disabled</td>
      <td>Disabled</td>
      <td>Disabled</td>
      <td>Free</td>
      <td>Low</td>
      <td>Excepteur sint occaecat cupidatat non proident.</td>
    </tr>
    <tr>
      <th scope="row">Sed do eiusmod</th>
      <td>Enabled</td>
      <td>Enabled</td>
      <td>Enabled</td>
      <td>Enabled</td>
      <td>$1,200 per year</td>
      <td>Medium</td>
      <td>Sunt in culpa qui officia deserunt mollit anim id est laborum.</td>
    </tr>
    <tr>
      <th scope="row">Tempor incididunt</th>
      <td>Disabled</td>
      <td>Disabled</td>
      <td>Enabled</td>
      <td>Enabled</td>
      <td>Free</td>
      <td>High</td>
      <td>Curabitur pretium tincidunt lacus, nulla gravida orci a odio.</td>
    </tr>
    <tr>
      <th scope="row">Labore et dolore</th>
      <td>Enabled</td>
      <td>Enabled</td>
      <td>Disabled</td>
      <td>Enabled</td>
      <td>$40 per month</td>
      <td>Low</td>
      <td>Nullam varius, turpis et commodo pharetra, est eros bibendum elit.</td>
    </tr>
    <tr>
      <th scope="row">Magna aliqua</th>
      <td>Enabled</td>
      <td>Enabled</td>
      <td>Enabled</td>
      <td>Disabled</td>
      <td>Free</td>
      <td>Medium</td>
      <td>Nec luctus magna felis sollicitudin mauris.</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <th scope="row">Total</th>
      <td>6</td>
      <td>6</td>
      <td>5</td>
      <td>5</td>
      <td>—</td>
      <td>—</td>
      <td>Integer in mauris eu nibh euismod gravida.</td>
    </tr>
  </tfoot>
</table>
