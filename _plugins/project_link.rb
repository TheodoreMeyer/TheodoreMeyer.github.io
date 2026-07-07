# frozen_string_literal: true

module Jekyll

  ##
  # Liquid tag for generating links within a project's documentation.
  #
  # This tag generates URLs in the form:
  #
  #   /projects/<project>/<path>/
  #
  # where `<project>` is taken from the page's `project` front matter.
  #
  # Examples:
  #
  #   {% project_link %}
  #   #=> /projects/simplevoicegeyser/
  #
  #   {% project_link commands %}
  #   #=> /projects/simplevoicegeyser/commands/
  #
  #   {% project_link joining/chrome-flags %}
  #   #=> /projects/simplevoicegeyser/joining/chrome-flags/
  #
  class ProjectLinkTag < Liquid::Tag

    ##
    # Creates a new ProjectLinkTag.
    #
    # @param tag_name [String] The Liquid tag name.
    # @param text [String] The text following the tag.
    # @param tokens [Array] Remaining Liquid tokens.
    #
    def initialize(tag_name, text, tokens)
      super
      @path = text.strip.sub(%r{^/+}, "")
    end

    ##
    # Renders the generated documentation URL.
    #
    # @param context [Liquid::Context] The current Liquid rendering context.
    # @return [String] The generated URL.
    #
    def render(context)
      page = context.registers[:page]
      site = context.registers[:site]

      project = page["project"]

      raise "project_link requires a 'project' front matter field." unless project

      base = "#{site.baseurl}/projects/#{project}"

      if @path.empty?
        "#{base}/"
      else
        "#{base}/#{@path.chomp("/")}/"
      end
    end

  end

end

Liquid::Template.register_tag("project_link", Jekyll::ProjectLinkTag)