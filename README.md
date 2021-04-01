# Search and Populate Data From Another Project

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.4251176.svg)](https://doi.org/10.5281/zenodo.4251176)

A REDCap Module to search another project for data to populate data into the current form. This module embeds REDCap's Search Query functionality into a data entry page to allow searches of _another_ project to populate fields in the current data entry page.

## Limitations
This module does not support target projects which have multiple arms. You will only receive data from the first arm.

## Prerequisites
- REDCap >= 9.7.8

## Easy Installation
- Obtain this module from the Consortium [REDCap Repo](https://redcap.vanderbilt.edu/consortium/modules/index.php) from the control center.

## Manual Installation
- Clone this repo into `<redcap-root>/modules/search_and_populate_data_from_another_project_v0.0.0`.
- Go to **Control Center > External Modules** and enable _Search and Populate Data From Another Project_.
- For each project you want to use this module, go to the project home page, click on **Manage External Modules** link, and then enable _Search and Populate Data From Another Project_ for that project.

## Configuration
Access **Manage External Modules** section of your project, click on _Search and Populate Data From Another Project_'s configure button, and save settings in order to specify the forms where the query box should be visible and provide the field mapping for each of those forms.

- **Project you wish to search**: The source project you will be searching and pulling values from.
    - **Note**: You may only select source projects to which you have access, but user permissions are _not_ checked while the module is used; by defining a source project you are granting access to the data contained in its mapped fields for everyone with access to the target project, _even for users without access to the source project_.
- **Limit fields to search**: Require selection of a single field to search from the source project.
    - Improves performance with large source projects
- **Enabled forms**
    - **Show in this form**: The instrument the following mapping will be applied to.
    - **JSON mapping source:target**: JSON which maps `source_field_names` from the source project to `target_field_names` in your current project.
