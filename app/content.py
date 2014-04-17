# -*- coding: utf-8 -*-
"""
    app.content
    ~~~~~~~~~~~

    Loads content into memory.

    At the moment this action occurs at import time, but should be wrapped
    into a function later.

    :author: Philip Schleihauf
    :copyright: © 2014 by Feedback Labs
    :license: 
"""

import os
from markdown import Markdown
from app import app


markdowner = Markdown(extensions=['meta'])


blog_posts = []
"""
[
  {
    meta: {}
    content: "..."
  },
  {
  ...
  }
]
"""

# walk the blogs folder
blog_folder = os.path.join(app.root_path, app.config['CONTENT_FOLDER'], 'blog')

for blog_filename in os.listdir(blog_folder):
    filepath = os.path.join(app.root_path, app.config['CONTENT_FOLDER'], 'blog', blog_filename)
    with open(filepath) as blog_file:
        content = markdowner.convert(blog_file.read())
    # todo: convert metadata strings to better types
    blog_posts.append({'meta': markdowner.Meta, 'content': content})
    markdowner.reset


# sort blogs by date


data = stories = []

